"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FoundPerson } from "@/server/finder/types";

export type EmailDraft = { recipient: string; subject: string; body: string };

type Props = { person: FoundPerson; draft: EmailDraft; onChange: (draft: EmailDraft) => void; onClose: () => void };

export function createEmailDraft(person: FoundPerson, firstName: string, searchedCompany: string, recipient: string): EmailDraft {
  const company = person.company?.trim() || searchedCompany.trim() || "[Company name]";
  const greeting = person.name && person.name !== "(name not provided)"
    ? person.name.trim().split(/\s+/)[0]
    : firstName.trim() || "[Recruiter's name]";
  return {
    recipient,
    subject: `Software engineering internship opportunities at ${company}`,
    body: `Hi ${greeting},

I wanted to reach out because I’m interested in software engineering internship opportunities at ${company}. I’d love the chance to contribute, learn from the team, and grow as a software engineer.

I’d appreciate any guidance you can share about relevant openings and the next steps in the recruiting process. I’m excited about the opportunity to move forward and would be happy to share my resume or any additional information.

Thank you for your time and consideration!

Best,
[Your name]`,
  };
}

/** Controlled draft: switching contacts does not discard edits. No messages are sent. */
export function RecruiterEmailDraft({ person, draft, onChange, onClose }: Props) {
  const id = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus(); }, []);
  const { recipient, subject, body } = draft;
  function update(field: keyof EmailDraft, value: string) {
    onChange({ ...draft, [field]: value });
    setFeedback("");
  }
  const [feedback, setFeedback] = useState("");
  const selected = person.emails.find((email) => email.address === recipient);
  const hasPlaceholders = /\[[^\]\n]+\]|\{\{[^}]+\}\}/.test(`${subject}\n${body}`);
  const canOpenGmail = Boolean(selected && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient) && subject.trim() && body.trim() && !hasPlaceholders);
  const gmailBlockReason = !selected ? "Choose a recipient address."
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient) ? "Choose a valid email address."
    : !subject.trim() ? "Add a subject."
    : !body.trim() ? "Write your message."
    : hasPlaceholders ? "Replace [Your name] and any other placeholders to continue." : "Ready to review in Gmail.";
  const gmailUrl = new URL("https://mail.google.com/mail/");
  gmailUrl.search = new URLSearchParams({ view: "cm", fs: "1", to: recipient, su: subject, body }).toString();

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setFeedback(`${label} copied.`);
    } catch {
      setFeedback("Could not copy automatically. Select the text and copy it manually.");
    }
  }

  return (
    <section className="email-draft" aria-labelledby={`${id}-title`}>
      <div className="draft-heading"><div><p className="eyebrow">02 / WRITE YOUR INTRODUCTION</p><h2 ref={headingRef} tabIndex={-1} id={`${id}-title`}>Email to {person.name}</h2></div><button type="button" className="close-draft" onClick={onClose} aria-label="Back to search results and keep draft">Back to results <span aria-hidden="true">←</span></button></div>
      <p className="draft-hint">Your draft stays here while you return to the search results. Review and send it in Gmail when you’re ready.</p>
      <label htmlFor={`${id}-to`}>To</label>
      <select id={`${id}-to`} value={recipient} onChange={(event) => update("recipient", event.target.value)} disabled={!person.emails.length}>
        <option value="">{person.emails.length ? "Choose an address to review" : "No email found"}</option>
        {person.emails.map((email) => <option key={email.address} value={email.address}>{email.address} · {email.verification.replace("_", " ")}</option>)}
      </select>
      {selected && selected.verification !== "valid" && <p className="draft-recipient-note">This address is marked {selected.verification.replace("_", " ")}. It is not confirmed deliverable; review it before contacting anyone.</p>}
      <label htmlFor={`${id}-subject`}>Subject</label>
      <input id={`${id}-subject`} value={subject} onChange={(event) => update("subject", event.target.value)} />
      <label htmlFor={`${id}-body`}>Message</label>
      <textarea id={`${id}-body`} rows={15} value={body} onChange={(event) => update("body", event.target.value)} />
      <p className={`gmail-readiness ${canOpenGmail ? "ready" : ""}`} id={`${id}-gmail-hint`}>{gmailBlockReason}</p>
      <div className="draft-actions">
        {canOpenGmail
          ? <a className="gmail-compose" href={gmailUrl.toString()} target="_blank" rel="noopener noreferrer">Open in Gmail <span aria-hidden="true">↗</span></a>
          : <button type="button" disabled aria-describedby={`${id}-gmail-hint`}>Open in Gmail ↗</button>}
        <button type="button" onClick={() => copy(subject, "Subject")} disabled={!subject.trim()}>Copy subject</button>
        <button type="button" onClick={() => copy(body, "Message")} disabled={!body.trim()}>Copy message</button>
      </div>
      <p className="draft-hint">Draft only · Opens Gmail in a new tab. Check your sending account before clicking Send. Changes are not saved after reloading this page.</p>
      <p className="draft-feedback" role="status" aria-live="polite">{feedback}</p>
    </section>
  );
}
