export type LookupOutcome = "not_requested" | "pending" | "found" | "not_found" | "failed";
export type VerificationStatus = "unverified" | "valid" | "invalid" | "catch_all" | "unknown";
export type RoleFilter = "recruiter" | "hiring_manager" | "any";
export type ProviderName = "hunter" | "pattern_guess";

export const roleFilters: RoleFilter[] = ["recruiter", "hiring_manager", "any"];

export type EmailCandidate = {
  address: string;
  verification: VerificationStatus;
  verificationProvider: ProviderName | null;
  /** ISO timestamp of the provider's check; null when never checked. */
  verifiedAt: string | null;
  /** Provider confidence score (0-100); null for guesses. */
  confidence: number | null;
};

export type FoundPerson = {
  name: string;
  title: string | null;
  linkedinUrl: string | null;
  emails: EmailCandidate[];
  sourceUrls: string[];
};

export type FinderInput = {
  domain: string;
  name?: string;
  role?: RoleFilter;
  limit?: number;
};

export type FinderResponse = {
  domain: string;
  provider: ProviderName;
  outcome: LookupOutcome;
  people: FoundPerson[];
  notes: string[];
  checkedAt: string;
};

/** Bad input from the caller; safe to show to them as-is. */
export class FinderInputError extends Error {}
