import type { PersonSummary } from "./types";

/** Entirely invented people and companies. No real contact information. */
export const demoPeople: readonly PersonSummary[] = [
  { id: "demo-avery", name: "Avery Morgan", title: "Technical Recruiter", company: "Example Labs", location: "San Francisco, CA", role: "recruiter", isDemo: true },
  { id: "demo-jordan", name: "Jordan Ellis", title: "Engineering Manager", company: "Example Studio", location: "Seattle, WA", role: "hiring_manager", isDemo: true },
  { id: "demo-riley", name: "Riley Quinn", title: "University Recruiter", company: "Example Works", location: "Austin, TX", role: "recruiter", isDemo: true },
];
