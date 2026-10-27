import type { EmailCandidate, FoundPerson, RoleFilter, VerificationStatus } from "./types.ts";

const BASE_URL = "https://api.hunter.io/v2";
const TIMEOUT_MS = 30_000;
const HIRING_MANAGER_TITLE = /manager|director|head|lead|vp|vice president|chief/i;

export type FetchLike = (url: URL, init: { headers: Record<string, string>; signal: AbortSignal }) => Promise<Response>;

export type HunterErrorKind = "auth" | "quota" | "opted_out" | "not_found" | "bad_request" | "unavailable";

/** Message is safe to show users; it never contains provider internals or the key. */
export class HunterError extends Error {
  kind: HunterErrorKind;
  constructor(kind: HunterErrorKind, message: string) {
    super(message);
    this.kind = kind;
  }
}

const errorByStatus: Record<number, [HunterErrorKind, string]> = {
  400: ["bad_request", "Hunter rejected the request."],
  401: ["auth", "Hunter rejected the API key. Check HUNTER_API_KEY."],
  403: ["quota", "Hunter rate limit reached. Try again shortly."],
  404: ["not_found", "Hunter found nothing for this request."],
  422: ["bad_request", "Hunter rejected the request."],
  429: ["quota", "Hunter usage limit reached for your plan."],
  451: ["opted_out", "Hunter has been asked not to process data for this person, so no address is available."],
};

async function hunterGet(
  path: string,
  params: Record<string, string | undefined>,
  apiKey: string,
  fetchImpl: FetchLike,
): Promise<unknown> {
  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  let response: Response;
  try {
    response = await fetchImpl(url, {
      headers: { "X-API-KEY": apiKey, accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new HunterError("unavailable", "Could not reach Hunter.");
  }
  if (!response.ok) {
    const [kind, message] = errorByStatus[response.status] ?? ["unavailable", "Hunter is unavailable right now."];
    throw new HunterError(kind, message);
  }
  try {
    return await response.json();
  } catch {
    throw new HunterError("unavailable", "Hunter returned an unreadable response.");
  }
}

function record(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function mapHunterStatus(status: string | null): VerificationStatus {
  switch (status) {
    case "valid":
      return "valid";
    case "invalid":
      return "invalid";
    case "accept_all":
      return "catch_all";
    case null:
      return "unverified";
    default:
      return "unknown";
  }
}

function toIso(value: unknown): string | null {
  const raw = text(value);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function toCandidate(address: string, verification: unknown, confidence: unknown): EmailCandidate {
  const info = record(verification);
  const status = mapHunterStatus(text(info.status));
  return {
    address,
    verification: status,
    verificationProvider: "hunter",
    verifiedAt: status === "unverified" ? null : toIso(info.date),
    confidence: typeof confidence === "number" ? confidence : null,
  };
}

function sourceUrls(sources: unknown): string[] {
  if (!Array.isArray(sources)) return [];
  return sources
    .map((source) => text(record(source).uri))
    .filter((uri): uri is string => uri !== null)
    .slice(0, 3);
}

function fullName(first: unknown, last: unknown): string {
  return [text(first), text(last)].filter(Boolean).join(" ") || "(name not provided)";
}

export async function hunterDomainSearch(
  domain: string,
  role: RoleFilter,
  limit: number,
  apiKey: string,
  fetchImpl: FetchLike,
): Promise<FoundPerson[]> {
  const body = record(
    await hunterGet(
      "/domain-search",
      {
        domain,
        limit: String(limit),
        type: "personal",
        department: role === "recruiter" ? "hr" : undefined,
        seniority: role === "hiring_manager" ? "senior,executive" : undefined,
      },
      apiKey,
      fetchImpl,
    ),
  );
  const emails = record(body.data).emails;
  if (!Array.isArray(emails)) return [];

  const people: FoundPerson[] = [];
  for (const entry of emails) {
    const item = record(entry);
    const address = text(item.value);
    if (!address) continue;
    const title = text(item.position);
    if (role === "hiring_manager" && !(title && HIRING_MANAGER_TITLE.test(title))) continue;
    people.push({
      name: fullName(item.first_name, item.last_name),
      title,
      linkedinUrl: text(item.linkedin),
      emails: [toCandidate(address, item.verification, item.confidence)],
      sourceUrls: sourceUrls(item.sources),
    });
  }
  return people;
}

export async function hunterEmailFinder(
  domain: string,
  name: { first: string; last: string },
  apiKey: string,
  fetchImpl: FetchLike,
): Promise<FoundPerson | null> {
  let body: Record<string, unknown>;
  try {
    body = record(
      await hunterGet("/email-finder", { domain, first_name: name.first, last_name: name.last }, apiKey, fetchImpl),
    );
  } catch (error) {
    if (error instanceof HunterError && error.kind === "not_found") return null;
    throw error;
  }
  const data = record(body.data);
  const address = text(data.email);
  if (!address) return null;
  return {
    name: fullName(data.first_name, data.last_name),
    title: text(data.position),
    linkedinUrl: text(data.linkedin_url),
    emails: [toCandidate(address, data.verification, data.score)],
    sourceUrls: sourceUrls(data.sources),
  };
}
