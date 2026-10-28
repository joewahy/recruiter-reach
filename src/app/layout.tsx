import type { Metadata } from "next";
import "./globals.css";
import { WorkspaceProvider } from "@/features/finder/workspace-context";

export const metadata: Metadata = {
  title: "Recruiter Reach · Find your next connection",
  description: "Find recruiter work emails and prepare a thoughtful introduction.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><WorkspaceProvider>{children}</WorkspaceProvider></body></html>;
}
