import { normalizeDomain } from "./domain.ts";
import { checkMailServers, guessAddresses, splitName } from "./guesser.ts";
import type { MxResolver } from "./guesser.ts";
import { HunterError, hunterDomainSearch, hunterEmailFinder } from "./hunter.ts";
import type { FetchLike } from "./hunter.ts";
import { FinderInputError } from "./types.ts";
import type { FinderInput, FinderResponse, FoundPerson } from "./types.ts";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export type FinderDeps = {
  /** Defaults to HUNTER_API_KEY. An empty string forces "no key". */
  apiKey?: string;
  fetch?: FetchLike;
  resolveMx?: MxResolver;
  now?: () => Date;
};

const inFlight = new Map<string, Promise<FinderResponse>>();

/** Identical concurrent requests share one lookup, so retries and double clicks cost one provider call. */
export function findContacts(input: FinderInput, deps: FinderDeps = {}): Promise<FinderResponse> {
  const key = [input.domain, input.name ?? "", input.role ?? "any", input.limit ?? ""].join("|").toLowerCase();
  const active = inFlight.get(key);
  if (active) return active;
  const promise = run(input, deps).finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}

async function run(input: FinderInput, deps: FinderDeps): Promise<FinderResponse> {
  const domain = normalizeDomain(input.domain);
  const role = input.role ?? "any";
  const limit = Math.min(Math.max(Math.trunc(input.limit ?? DEFAULT_LIMIT) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const apiKey = (deps.apiKey ?? process.env.HUNTER_API_KEY ?? "").trim();
  const fetchImpl: FetchLike = deps.fetch ?? fetch;
  const checkedAt = (deps.now ?? (() => new Date()))().toISOString();
  const notes: string[] = [];
  const name = input.name?.trim();

  if (name) {
    const parsed = splitName(name);
    if (!parsed) throw new FinderInputError("Enter the person's first and last name.");

    if (apiKey) {
      try {
        const person = await hunterEmailFinder(domain, parsed, apiKey, fetchImpl);
        if (person) return { domain, provider: "hunter", outcome: "found", people: [person], notes, checkedAt };
        notes.push("Hunter found no address for this name; showing unverified pattern guesses instead.");
      } catch (error) {
        if (!(error instanceof HunterError)) throw error;
        if (error.kind === "opted_out") {
          return { domain, provider: "hunter", outcome: "not_found", people: [], notes: [error.message], checkedAt };
        }
        notes.push(`${error.message} Showing unverified pattern guesses instead.`);
      }
    } else {
      notes.push("HUNTER_API_KEY is not set; showing unverified pattern guesses only.");
    }

    const mail = await checkMailServers(domain, deps.resolveMx);
    if (mail === "no") {
      notes.push(`${domain} has no mail servers (MX records), so no addresses are suggested.`);
      return { domain, provider: "pattern_guess", outcome: "not_found", people: [], notes, checkedAt };
    }
    if (mail === "error") {
      notes.push(`Could not check whether ${domain} accepts mail. Try again.`);
      return { domain, provider: "pattern_guess", outcome: "failed", people: [], notes, checkedAt };
    }
    notes.push("Guessed from common patterns. Unverified: none of these are confirmed to exist.");
    const person: FoundPerson = {
      name,
      title: null,
      linkedinUrl: null,
      emails: guessAddresses(parsed, domain),
      sourceUrls: [],
    };
    return { domain, provider: "pattern_guess", outcome: "found", people: [person], notes, checkedAt };
  }

  if (!apiKey) {
    throw new FinderInputError(
      "Finding recruiters at a company needs HUNTER_API_KEY. Without a key, pass a name to guess one person's address.",
    );
  }
  try {
    const people = await hunterDomainSearch(domain, role, limit, apiKey, fetchImpl);
    if (role === "hiring_manager") notes.push("Hiring managers are matched by title keywords, which is a heuristic.");
    return { domain, provider: "hunter", outcome: people.length ? "found" : "not_found", people, notes, checkedAt };
  } catch (error) {
    if (!(error instanceof HunterError)) throw error;
    return { domain, provider: "hunter", outcome: "failed", people: [], notes: [error.message], checkedAt };
  }
}
