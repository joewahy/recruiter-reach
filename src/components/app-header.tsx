import Link from "next/link";

export function AppHeader({ step = "search" }: { step?: "search" | "draft" }) {
  return <header className="topbar">
    <Link className="brand" href="/"><span className="brand-icon" aria-hidden="true">r</span>Recruiter Reach<span className="brand-dot">.</span></Link>
    <nav className="flow-nav" aria-label="Outreach steps">
      <Link href="/#find-recruiter" aria-current={step === "search" ? "step" : undefined}>01 <span>Find a recruiter</span></Link>
      <span className="flow-divider" aria-hidden="true">/</span>
      <span aria-current={step === "draft" ? "step" : undefined}>02 <span>Write your email</span></span>
    </nav>
  </header>;
}
