"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { RecruiterEmailDraft } from "@/features/finder/recruiter-email-draft";
import { useWorkspace } from "@/features/finder/workspace-context";

export default function DraftPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { drafts, updateDraft } = useWorkspace();
  const entry = drafts[id];

  return <main>
    <AppHeader step="draft" />
    <div className="draft-page">
      <Link className="back-link" href="/#find-recruiter">← Back to search results</Link>
      {entry ? <>
        <div className="draft-page-intro"><p className="eyebrow">WRITE YOUR EMAIL</p><h1>Make it personal.</h1><p>A starting point, ready for your own words. Review the details, then open it in Gmail.</p></div>
        <RecruiterEmailDraft person={entry.person} draft={entry.draft} onChange={(draft) => updateDraft(id, draft)} onClose={() => router.push("/#find-recruiter")} />
      </> : <section className="missing-draft"><p className="eyebrow">EMAIL DRAFT</p><h1>This draft isn’t available.</h1><p>Drafts stay in this tab while you navigate. If you refreshed or opened this link in another tab, find the recruiter again to create a new draft.</p><Link className="primary-link" href="/#find-recruiter">Find a recruiter →</Link></section>}
    </div>
  </main>;
}
