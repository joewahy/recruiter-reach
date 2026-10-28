import assert from "node:assert/strict";
import { test } from "node:test";
import { parsePublicProfile, readPublicProfile } from "../src/server/finder/public-profile.ts";
import { findContacts } from "../src/server/finder/find.ts";

const profile = `<script type="application/ld+json">${JSON.stringify({ "@graph": [
  { "@type": "Person", name: "Unrelated Author", url: "https://linkedin.com/in/somebody-else" },
  { "@type": "Person", name: "Jane Example", url: "https://www.linkedin.com/in/jane-example", jobTitle: "Technical Recruiter", worksFor: { "@type": "Organization", name: "Example Labs" } },
] })}</script>`;

test("public parser selects the matching Person and never guesses an email", () => {
  const person = parsePublicProfile(profile, "jane-example");
  assert.equal(person?.name, "Jane Example");
  assert.equal(person?.company, "Example Labs");
  assert.equal(person?.title, "Technical Recruiter");
  assert.deepEqual(person?.emails, []);
  assert.equal(parsePublicProfile(profile, "missing"), null);
  assert.equal(parsePublicProfile('<title>Jane Example - Example Labs</title>', 'jane-example'), null);
  assert.equal(parsePublicProfile('<script type="application/ld+json">broken</script>', 'jane-example'), null);
});

test("public read uses a fixed host, no credentials, and manual redirects", async () => {
  const result = await readPublicProfile("jane-example", async (url, init) => {
    assert.equal(url.toString(), "https://www.linkedin.com/in/jane-example");
    assert.equal(init.redirect, "manual");
    assert.equal(new Headers(init.headers).has("cookie"), false);
    assert.equal(new Headers(init.headers).has("X-API-KEY"), false);
    return new Response(profile, { headers: { "content-type": "text/html" } });
  });
  assert.equal(result.person?.name, "Jane Example");
});

test("blocked responses, login redirects, oversized and non-HTML data never become profiles", async () => {
  for (const response of [
    new Response(null, { status: 403 }),
    new Response(null, { status: 302, headers: { location: "https://www.linkedin.com/login" } }),
    Response.json({ name: "Jane" }),
    new Response("x".repeat(1_000_001), { headers: { "content-type": "text/html" } }),
  ]) {
    const result = await readPublicProfile("jane-example", async () => response);
    assert.equal(result.person, null);
    assert.ok(result.note.length > 0);
  }
});

test("Hunter no-match falls back to a public profile with no invented email or domain", async () => {
  const result = await findContacts({ linkedinUrl: "https://linkedin.com/in/jane-example" }, {
    apiKey: "key",
    fetch: async () => Response.json({ data: {} }),
    publicFetch: async () => new Response(profile, { headers: { "content-type": "text/html" } }),
  });
  assert.equal(result.outcome, "found");
  assert.equal(result.provider, "public_profile");
  assert.equal(result.domain, null);
  assert.equal(result.people[0].company, "Example Labs");
  assert.deepEqual(result.people[0].emails, []);
});

test("opt-out never invokes the public reader", async () => {
  let reads = 0;
  const result = await findContacts({ linkedinUrl: "https://linkedin.com/in/opted-out" }, {
    apiKey: "key",
    fetch: async () => Response.json({}, { status: 451 }),
    publicFetch: async () => { reads++; return new Response(profile); },
  });
  assert.equal(reads, 0);
  assert.equal(result.outcome, "not_found");
  assert.deepEqual(result.people, []);
});
