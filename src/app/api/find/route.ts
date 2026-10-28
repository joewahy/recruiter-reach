import { NextResponse } from "next/server";
import { findContacts } from "@/server/finder/find";
import { FinderInputError, roleFilters } from "@/server/finder/types";
import type { RoleFilter } from "@/server/finder/types";

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;
let windowStart = 0;
let requestCount = 0;

/** Lookups can spend provider credits, so cap them. In-memory: fine for local use only. */
function overLimit(): boolean {
  const now = Date.now();
  if (now - windowStart > WINDOW_MS) {
    windowStart = now;
    requestCount = 0;
  }
  requestCount += 1;
  return requestCount > MAX_REQUESTS_PER_WINDOW;
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const domain = params.get("domain");
  const company = params.get("company");
  const linkedinUrl = params.get("linkedinUrl");
  const role = (params.get("role") ?? "any") as RoleFilter;
  const limitParam = params.get("limit");

  if (!domain?.trim() && !company?.trim() && !linkedinUrl?.trim()) return json({ error: "Enter a company name, website, or LinkedIn profile URL." }, 400);
  if (!roleFilters.includes(role)) return json({ error: `role must be one of: ${roleFilters.join(", ")}.` }, 400);
  if (overLimit()) return json({ error: "Too many lookups. Wait a minute and try again." }, 429);

  try {
    const result = await findContacts({
      domain: domain ?? undefined,
      company: company ?? undefined,
      linkedinUrl: linkedinUrl ?? undefined,
      name: params.get("name") ?? undefined,
      role,
      limit: limitParam ? Number(limitParam) : undefined,
    });
    return json(result);
  } catch (error) {
    if (error instanceof FinderInputError) return json({ error: error.message }, 400);
    return json({ error: "Lookup failed unexpectedly." }, 500);
  }
}
