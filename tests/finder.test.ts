import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeDomain } from "../src/server/finder/domain.ts";
import { findContacts } from "../src/server/finder/find.ts";
import { guessAddresses, splitName } from "../src/server/finder/guesser.ts";
import { mapHunterStatus } from "../src/server/finder/hunter.ts";
import type { FetchLike } from "../src/server/finder/hunter.ts";
import { FinderInputError } from "../src/server/finder/types.ts";

const hasMail = async () => [{ exchange: "mx.example.com" }];
const noMail = async () => {
  throw Object.assign(new Error("no such domain"), { code: "ENOTFOUND" });
};

function fakeFetch(status: number, body: unknown) {
  const calls: Array<{ url: URL; headers: Record<string, string> }> = [];
  const impl: FetchLike = async (url, init) => {
    calls.push({ url, headers: init.headers });
    return new Response(JSON.stringify(body), { status });
  };
  return { impl, calls };
}

test("normalizeDomain accepts urls and emails, rejects junk", () => {
  assert.equal(normalizeDomain("https://www.Example.com/jobs?x=1"), "example.com");
  assert.equal(normalizeDomain("jane@example.com"), "example.com");
  assert.throws(() => normalizeDomain("not a domain"), FinderInputError);
  assert.throws(() => normalizeDomain("localhost"), FinderInputError);
});

test("splitName and guessAddresses build unverified candidates", () => {
  assert.equal(splitName("Jane"), null);
  const name = splitName("Zoë van der Berg");
  assert.deepEqual(name, { first: "zoe", last: "berg" });
  const guesses = guessAddresses({ first: "jane", last: "doe" }, "example.com");
  assert.equal(guesses[0].address, "jane.doe@example.com");
  assert.ok(guesses.every((g) => g.verification === "unverified" && g.verifiedAt === null));
  assert.equal(new Set(guesses.map((g) => g.address)).size, guesses.length);
});

test("mapHunterStatus normalizes provider statuses", () => {
  assert.equal(mapHunterStatus("valid"), "valid");
  assert.equal(mapHunterStatus("accept_all"), "catch_all");
  assert.equal(mapHunterStatus("webmail"), "unknown");
  assert.equal(mapHunterStatus(null), "unverified");
});

test("domain search without a key or name is an input error", async () => {
  await assert.rejects(findContacts({ domain: "example.com" }, { apiKey: "" }), FinderInputError);
});

test("name without a key returns labeled guesses and never calls Hunter", async () => {
  const { impl, calls } = fakeFetch(200, {});
  const result = await findContacts(
    { domain: "example.com", name: "Jane Doe" },
    { apiKey: "", fetch: impl, resolveMx: hasMail },
  );
  assert.equal(calls.length, 0);
  assert.equal(result.provider, "pattern_guess");
  assert.equal(result.outcome, "found");
  assert.ok(result.people[0].emails.every((e) => e.verification === "unverified"));
  assert.ok(result.notes.some((n) => n.includes("HUNTER_API_KEY")));
});

test("guesser returns not_found when the domain has no mail servers", async () => {
  const result = await findContacts(
    { domain: "example.com", name: "Jane Doe" },
    { apiKey: "", resolveMx: noMail },
  );
  assert.equal(result.outcome, "not_found");
  assert.equal(result.people.length, 0);
});

test("recruiter domain search maps Hunter results and keeps the key out of the URL", async () => {
  const { impl, calls } = fakeFetch(200, {
    data: {
      emails: [
        {
          value: "jane.doe@example.com",
          first_name: "Jane",
          last_name: "Doe",
          position: "Technical Recruiter",
          confidence: 91,
          linkedin: "https://www.linkedin.com/in/example",
          verification: { date: "2026-01-15", status: "valid" },
          sources: [{ uri: "https://example.com/team" }],
        },
        { value: null, first_name: "No", last_name: "Address" },
      ],
    },
  });
  const result = await findContacts(
    { domain: "Example.com", role: "recruiter" },
    { apiKey: "secret-key", fetch: impl },
  );
  assert.equal(result.provider, "hunter");
  assert.equal(result.outcome, "found");
  assert.equal(result.people.length, 1);
  const email = result.people[0].emails[0];
  assert.equal(email.address, "jane.doe@example.com");
  assert.equal(email.verification, "valid");
  assert.equal(email.verifiedAt, "2026-01-15T00:00:00.000Z");
  assert.equal(calls[0].url.searchParams.get("department"), "hr");
  assert.equal(calls[0].url.searchParams.get("domain"), "example.com");
  assert.ok(!calls[0].url.toString().includes("secret-key"));
  assert.equal(calls[0].headers["X-API-KEY"], "secret-key");
});

test("hiring_manager role filters by title heuristic and says so", async () => {
  const { impl } = fakeFetch(200, {
    data: {
      emails: [
        { value: "a@example.com", first_name: "A", last_name: "One", position: "Engineering Manager" },
        { value: "b@example.com", first_name: "B", last_name: "Two", position: "Software Engineer" },
      ],
    },
  });
  const result = await findContacts(
    { domain: "example.com", role: "hiring_manager" },
    { apiKey: "k", fetch: impl },
  );
  assert.deepEqual(result.people.map((p) => p.emails[0].address), ["a@example.com"]);
  assert.ok(result.notes.some((n) => n.includes("heuristic")));
});

test("unknown Hunter verification stays unverified, not valid", async () => {
  const { impl } = fakeFetch(200, { data: { emails: [{ value: "a@example.com", first_name: "A", last_name: "B" }] } });
  const result = await findContacts({ domain: "example.com" }, { apiKey: "k", fetch: impl });
  assert.equal(result.people[0].emails[0].verification, "unverified");
  assert.equal(result.people[0].emails[0].verifiedAt, null);
});

test("Hunter auth failure on domain search is a failed outcome with a safe message", async () => {
  const { impl } = fakeFetch(401, { errors: [{ details: "internal detail" }] });
  const result = await findContacts({ domain: "example.com" }, { apiKey: "bad", fetch: impl });
  assert.equal(result.outcome, "failed");
  assert.ok(!result.notes.join(" ").includes("internal detail"));
});

test("opted-out person (451) returns not_found and is not guessed", async () => {
  const { impl } = fakeFetch(451, {});
  const result = await findContacts(
    { domain: "example.com", name: "Opted Out" },
    { apiKey: "k", fetch: impl, resolveMx: hasMail },
  );
  assert.equal(result.outcome, "not_found");
  assert.equal(result.people.length, 0);
});

test("Hunter email finder with no address falls back to guesses with a note", async () => {
  const { impl } = fakeFetch(200, { data: { email: null } });
  const result = await findContacts(
    { domain: "example.com", name: "Jane Doe" },
    { apiKey: "k", fetch: impl, resolveMx: hasMail },
  );
  assert.equal(result.provider, "pattern_guess");
  assert.ok(result.notes.some((n) => n.includes("Hunter found no address")));
});

test("identical concurrent lookups share one provider call", async () => {
  const { impl, calls } = fakeFetch(200, { data: { emails: [] } });
  const input = { domain: "example.com" };
  const [a, b] = await Promise.all([
    findContacts(input, { apiKey: "k", fetch: impl }),
    findContacts(input, { apiKey: "k", fetch: impl }),
  ]);
  assert.equal(calls.length, 1);
  assert.equal(a, b);
});
