import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recruiter Reach · Learning starter",
  description: "A small demo foundation for a job-search outreach app.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
