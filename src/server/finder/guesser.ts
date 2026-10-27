import { resolveMx } from "node:dns/promises";
import type { EmailCandidate } from "./types.ts";

export type MxResolver = (domain: string) => Promise<unknown[]>;

function cleanPart(part: string): string {
  return part
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

/** First and last word of a full name, reduced to a-z. Null when either is missing. */
export function splitName(fullName: string): { first: string; last: string } | null {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) return null;
  const first = cleanPart(words[0]);
  const last = cleanPart(words[words.length - 1]);
  return first && last ? { first, last } : null;
}

const patterns: Array<(first: string, last: string) => string> = [
  (f, l) => `${f}.${l}`,
  (f, l) => `${f}${l}`,
  (f, l) => `${f[0]}${l}`,
  (f) => f,
  (f, l) => `${f[0]}.${l}`,
  (f, l) => `${f}_${l}`,
  (f, l) => `${f}${l[0]}`,
  (f, l) => `${l}.${f}`,
];

/** Guessed addresses, most common patterns first. Never verified. */
export function guessAddresses(name: { first: string; last: string }, domain: string): EmailCandidate[] {
  const seen = new Set<string>();
  const candidates: EmailCandidate[] = [];
  for (const build of patterns) {
    const address = `${build(name.first, name.last)}@${domain}`;
    if (seen.has(address)) continue;
    seen.add(address);
    candidates.push({
      address,
      verification: "unverified",
      verificationProvider: null,
      verifiedAt: null,
      confidence: null,
    });
  }
  return candidates;
}

/** "yes" has MX records, "no" the domain has none, "error" the DNS check itself failed. */
export async function checkMailServers(
  domain: string,
  resolver: MxResolver = resolveMx,
): Promise<"yes" | "no" | "error"> {
  try {
    const records = await resolver(domain);
    return records.length > 0 ? "yes" : "no";
  } catch (error) {
    const code = (error as { code?: string }).code;
    return code === "ENOTFOUND" || code === "ENODATA" ? "no" : "error";
  }
}
