import { FinderInputError } from "./types.ts";

const DOMAIN_PATTERN = /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

/** Accepts "stripe.com", "https://www.stripe.com/jobs", or "a@stripe.com". */
export function normalizeDomain(raw: string): string {
  let domain = raw.trim().toLowerCase();
  domain = domain.replace(/^[a-z][a-z0-9+.-]*:\/\//, "");
  domain = domain.replace(/^.*@/, "");
  domain = domain.split(/[/?#:]/)[0];
  domain = domain.replace(/^www\./, "").replace(/\.$/, "");
  if (!DOMAIN_PATTERN.test(domain)) {
    throw new FinderInputError(`"${raw}" doesn't look like a company domain, e.g. stripe.com.`);
  }
  return domain;
}
