/** Public profile summary. Email lookup belongs in a later server-side feature. */
export type PersonSummary = {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  role: "recruiter" | "hiring_manager";
  isDemo: true;
};
