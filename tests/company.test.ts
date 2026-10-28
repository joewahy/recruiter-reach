import assert from "node:assert/strict";
import { test } from "node:test";
import { findContacts } from "../src/server/finder/find.ts";
import { FinderInputError } from "../src/server/finder/types.ts";

test("company names are sent to Hunter without inventing a company domain", async () => {
  const result = await findContacts({ name: "Jane Doe", company: "Example Labs" }, {
    apiKey: "key",
    fetch: async (url) => {
      assert.equal(url.searchParams.get("company"), "Example Labs");
      assert.equal(url.searchParams.get("first_name"), "jane");
      assert.equal(url.searchParams.get("last_name"), "doe");
      assert.equal(url.searchParams.has("domain"), false);
      return Response.json({ data: { first_name: "Jane", last_name: "Doe", company: "Example Labs", email: "jane@example.com" } });
    },
  });
  assert.equal(result.outcome, "found");
  assert.equal(result.people[0].company, "Example Labs");
  assert.equal(result.people[0].emails[0].verification, "unverified");
});

test("company websites reuse domain lookup and unverified pattern fallback", async () => {
  const result = await findContacts({ name: "Jane Doe", company: "https://www.example.com/jobs" }, {
    apiKey: "", resolveMx: async () => [{ exchange: "mail.example.com" }],
  });
  assert.equal(result.domain, "example.com");
  assert.equal(result.provider, "pattern_guess");
  assert.ok(result.people[0].emails.every((email) => email.verification === "unverified"));
});

test("company-name lookup needs a complete name and a key", async () => {
  await assert.rejects(findContacts({ name: "Jane", company: "Example Labs" }, { apiKey: "key" }), FinderInputError);
  await assert.rejects(findContacts({ name: "Jane Doe", company: "Example Labs" }, { apiKey: "" }), /requires Hunter/);
});

test("company-name no matches, opt-outs, and auth failures never produce guesses", async () => {
  for (const [status, outcome] of [[200, "not_found"], [451, "not_found"], [401, "failed"]] as const) {
    const result = await findContacts({ name: "Jane Doe", company: `Example Labs ${status}` }, {
      apiKey: "key", fetch: async () => Response.json({ data: {} }, { status }),
      resolveMx: async () => { throw new Error("Must not guess a company domain"); },
    });
    assert.equal(result.outcome, outcome);
    assert.deepEqual(result.people, []);
    assert.equal(result.domain, null);
  }
});
