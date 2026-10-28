import assert from "node:assert/strict";
import { test } from "node:test";
import { linkedinHandle } from "../src/server/finder/linkedin.ts";
import { findContacts } from "../src/server/finder/find.ts";
import { FinderInputError } from "../src/server/finder/types.ts";

const blockedPublicFetch = async () => new Response(null, { status: 403 });

test("profile URLs normalize to handles without tracking parameters", () => {
  assert.equal(linkedinHandle("https://www.linkedin.com/in/jane-doe/?trk=search#about"), "jane-doe");
  assert.equal(linkedinHandle("https://uk.linkedin.com/in/jane-doe"), "jane-doe");
  assert.equal(linkedinHandle("https://linkedin.com/in/jos%C3%A9-example"), "josé-example");
  for (const url of ["https://linkedin.com.evil.example/in/jane", "https://linkedin.com/company/example", "https://example.com/in/jane", "http://linkedin.com/in/jane", "https://user@linkedin.com/in/jane", "https://linkedin.com/in/a%2Fb", "https://linkedin.com/in/", "https://linkedin.com/in/a/details", "https://linkedin.com:8443/in/jane"]) {
    assert.throws(() => linkedinHandle(url), FinderInputError);
  }
});

test("LinkedIn-only lookup sends a handle to Hunter, maps identity, and needs no domain or name", async () => {
  let count = 0;
  const result = await findContacts({ linkedinUrl: "https://www.linkedin.com/in/jane-example?trk=search" }, {
    apiKey: "secret", publicFetch: blockedPublicFetch,
    fetch: async (url, init) => {
      count++;
      assert.equal(url.origin, "https://api.hunter.io");
      assert.equal(url.pathname, "/v2/email-finder");
      assert.equal(url.searchParams.get("linkedin_handle"), "jane-example");
      assert.equal(url.searchParams.has("domain"), false);
      assert.equal(url.searchParams.has("first_name"), false);
      assert.equal(url.toString().includes("secret"), false);
      assert.equal(init.headers["X-API-KEY"], "secret");
      return Response.json({ data: { first_name: "Jane", last_name: "Example", company: "Example Labs", domain: "example.com", position: "Recruiter", email: "jane@example.com", verification: { status: "valid", date: "2026-10-27" } } });
    },
    resolveMx: async () => { throw new Error("Must not guess from a LinkedIn handle"); },
  });
  assert.equal(count, 1);
  assert.equal(result.outcome, "found");
  assert.equal(result.domain, "example.com");
  assert.equal(result.people[0].name, "Jane Example");
  assert.equal(result.people[0].company, "Example Labs");
  assert.equal(result.people[0].emails[0].verification, "valid");
});

test("missing key uses public fallback and invalid profile fails before a request", async () => {
  const result = await findContacts({ linkedinUrl: "https://www.linkedin.com/in/no-key" }, { apiKey: "", publicFetch: blockedPublicFetch });
  assert.equal(result.provider, "public_profile");
  assert.equal(result.outcome, "not_found");
  await assert.rejects(findContacts({ linkedinUrl: "https://example.com/in/jane" }, { apiKey: "key", publicFetch: blockedPublicFetch, fetch: async () => { throw new Error("must not call"); } }), FinderInputError);
});

test("LinkedIn lookup does not invent names, domains, or guesses on no-match, opt-out, or failure", async () => {
  for (const [status, outcome] of [[200, "not_found"], [404, "not_found"], [451, "not_found"], [401, "failed"], [429, "failed"]] as const) {
    const result = await findContacts({ linkedinUrl: `https://www.linkedin.com/in/test-${status}` }, {
      apiKey: "key", publicFetch: blockedPublicFetch, fetch: async () => Response.json({ data: {} }, { status }),
      resolveMx: async () => { throw new Error("Must not guess"); },
    });
    assert.equal(result.outcome, outcome);
    assert.equal(result.domain, null);
    assert.deepEqual(result.people, []);
  }
});

test("profile identity can be returned without an email; no verification is invented", async () => {
  const result = await findContacts({ linkedinUrl: "https://linkedin.com/in/profile-only" }, {
    apiKey: "key", publicFetch: blockedPublicFetch, fetch: async () => Response.json({ data: { first_name: "Jane", company: "Example Labs" } }),
  });
  assert.equal(result.outcome, "found");
  assert.deepEqual(result.people[0].emails, []);
  assert.equal(result.people[0].company, "Example Labs");
  assert.equal(result.domain, null);
});

test("identical simultaneous LinkedIn lookups share a provider call", async () => {
  let calls = 0;
  const deps = { apiKey: "key", publicFetch: blockedPublicFetch, fetch: async () => { calls++; return Response.json({ data: {} }); } };
  const input = { linkedinUrl: "https://linkedin.com/in/concurrent-example" };
  const [a, b] = await Promise.all([findContacts(input, deps), findContacts(input, deps)]);
  assert.equal(calls, 1);
  assert.equal(a, b);
});
