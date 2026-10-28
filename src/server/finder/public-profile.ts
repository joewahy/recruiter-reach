import { linkedinHandle } from "./linkedin.ts";
import type { FoundPerson } from "./types.ts";

export type PublicProfileFetch = (url: URL, init: RequestInit) => Promise<Response>;
export type PublicProfileResult = { person: FoundPerson | null; note: string };
const MAX_BYTES = 1_000_000;

function object(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" ? value as Record<string, unknown> : {};
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 500) : null;
}

/** Only use explicit Person data associated with this exact profile, never title/slug guesses. */
export function parsePublicProfile(html: string, handle: string): FoundPerson | null {
  const scripts = html.matchAll(/<script\b[^>]*\btype\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script\s*>/gi);
  for (const script of scripts) {
    let data: unknown;
    try { data = JSON.parse(script[1]); } catch { continue; }
    const queue: unknown[] = [data];
    for (let count = 0; queue.length && count < 1000; count++) {
      const value = queue.shift();
      if (Array.isArray(value)) { queue.push(...value); continue; }
      const item = object(value);
      const types = Array.isArray(item["@type"]) ? item["@type"] : [item["@type"]];
      if (types.includes("Person")) {
        let matches = false;
        try { matches = linkedinHandle(String(item.url ?? item["@id"] ?? "")) === handle; } catch { /* unrelated person */ }
        const name = text(item.name);
        if (matches && name) {
          const employers = Array.isArray(item.worksFor) ? item.worksFor : [item.worksFor];
          return {
            name,
            company: employers.length === 1 ? text(object(employers[0]).name) : null,
            title: text(item.jobTitle),
            linkedinUrl: `https://www.linkedin.com/in/${encodeURIComponent(handle)}`,
            emails: [],
            sourceUrls: [`https://www.linkedin.com/in/${encodeURIComponent(handle)}`],
          };
        }
      }
      queue.push(...Object.values(item).filter((entry) => entry !== null && typeof entry === "object"));
    }
  }
  return null;
}

/** One bounded public request. No cookies, login sessions, proxy rotation, or redirects. */
export async function readPublicProfile(handle: string, fetchImpl: PublicProfileFetch = fetch): Promise<PublicProfileResult> {
  const url = new URL(`https://www.linkedin.com/in/${encodeURIComponent(handle)}`);
  try {
    const response = await fetchImpl(url, {
      redirect: "manual",
      headers: { accept: "text/html", "User-Agent": "RecruiterReach/0.1 (public profile lookup)" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) {
      await response.body?.cancel();
      return { person: null, note: `LinkedIn did not allow a public profile read (HTTP ${response.status}). No login, redirect, or access restriction was bypassed.` };
    }
    if (!response.headers.get("content-type")?.includes("text/html") || !response.body) {
      await response.body?.cancel();
      return { person: null, note: "LinkedIn did not return a public HTML profile." };
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let bytes = 0;
    let html = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > MAX_BYTES) {
          await reader.cancel();
          return { person: null, note: "Public profile response exceeded the size limit." };
        }
        html += decoder.decode(value, { stream: true });
      }
      html += decoder.decode();
    } finally { reader.releaseLock(); }
    const person = parsePublicProfile(html, handle);
    return { person, note: person
      ? "Profile details were read from public LinkedIn structured data. No email was extracted; employment details may be incomplete or out of date."
      : "LinkedIn returned no readable structured data for this profile. The page may require login or may not expose this information publicly." };
  } catch {
    return { person: null, note: "Could not read the public LinkedIn profile. It may be unavailable or blocking automated access." };
  }
}
