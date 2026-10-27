import { parseArgs } from "node:util";
import { findContacts } from "../src/server/finder/find.ts";
import { FinderInputError, roleFilters } from "../src/server/finder/types.ts";
import type { RoleFilter } from "../src/server/finder/types.ts";

const usage = `Usage: npm run find -- <domain> [options]

  <domain>            Company domain, e.g. stripe.com
  -n, --name <name>   Guess/find one person's address ("Jane Doe")
  -r, --role <role>   ${roleFilters.join(" | ")} (default: any; used when no name is given)
  -l, --limit <n>     Max people from Hunter (default 10)
      --json          Print raw JSON
  -h, --help          Show this help

Without a name, Hunter discovery is used and needs HUNTER_API_KEY (see .env.example).
Hunter lookups may use credits on your Hunter plan.`;

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    name: { type: "string", short: "n" },
    role: { type: "string", short: "r", default: "any" },
    limit: { type: "string", short: "l" },
    json: { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
});

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

if (values.help) {
  console.log(usage);
  process.exit(0);
}
if (positionals.length !== 1) fail(usage);
if (!roleFilters.includes(values.role as RoleFilter)) fail(`--role must be one of: ${roleFilters.join(", ")}`);

try {
  const result = await findContacts({
    domain: positionals[0],
    name: values.name,
    role: values.role as RoleFilter,
    limit: values.limit ? Number(values.limit) : undefined,
  });

  if (values.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`${result.domain} · ${result.provider} · ${result.outcome} · checked ${result.checkedAt}\n`);
    for (const person of result.people) {
      console.log(person.title ? `${person.name} - ${person.title}` : person.name);
      for (const email of person.emails) {
        const details = [email.verification, email.verificationProvider, email.confidence !== null ? `confidence ${email.confidence}` : null];
        console.log(`  ${email.address}  [${details.filter(Boolean).join(", ")}]`);
      }
      if (person.linkedinUrl) console.log(`  ${person.linkedinUrl}`);
    }
    if (result.people.length) console.log("");
    for (const note of result.notes) console.log(`Note: ${note}`);
  }
  if (result.outcome === "failed") process.exit(1);
} catch (error) {
  if (error instanceof FinderInputError) fail(error.message);
  fail("Lookup failed unexpectedly.");
}
