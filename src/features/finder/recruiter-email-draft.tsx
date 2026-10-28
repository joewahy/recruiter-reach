"use client";

import { useId, useState } from "react";
import type { FoundPerson } from "@/server/finder/types";

type Props = { person: FoundPerson; firstName: string; searchedCompany: string };

/** An editable, local draft. It does not connect to a mailbox or send anything. */
export function RecruiterEmailDraft({ person, firstName, searchedCompany }: Props) {
  const id = useId();
  const company = person.company?.trim() || searchedCompany.trim() || "[Company name]";
  const greeting = person.name && person.name !== "(name not provided)"
    ? person.name.trim().split(/\s+/)[0]
    : firstName.trim() || "[Recruiter's name]";
  const [recipient, setRecipient] = useState(person.emails.length === 1 ? person.emails[0].address : "");
  const [subject, setSubject] = useState(`Software engineering internship opportunities at ${company}`);
  const [body, setBody] = useState(`Hi ${greeting},

I wanted to reach out because I’m interested in software engineering internship opportunities at ${company}. I’d love the chance to contribute, learn from the team, and grow as a software engineer.

I’d appreciate any guidance you can share about relevant openings and the next steps in the recruiting process. I’m excited about the opportunity to move forward and would be happy to share my resume or any additional information.

Thank you for your time and consideration!

Best,
[Your name]`);
  const [feedback, setFeedback] = useState("");
  const selected = person.emails.find((email) => email.address === recipient);
  const hasPlaceholders = /\[[^\]\n]+\]|\{\{[^}]+\}\}/.test(`${subject}\n${body}`);
  const canOpenGmail = Boolean(selected && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient) && subject.trim() && body.trim() && !hasPlaceholders);
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
      <div className="draft-heading"><div><p className="eyebrow">YOUR INTRODUCTION</p><h4 id={`${id}-title`}>A starting point for your outreach</h4></div><span className="draft-badge">Draft only</span></div>
      <p className="draft-hint">Personalize the message and replace [Your name] before using it. This draft stays in this page until you leave or change your search.</p>
      <label htmlFor={`${id}-to`}>To</label>
      <select id={`${id}-to`} value={recipient} onChange={(event) => { setRecipient(event.target.value); setFeedback(""); }} disabled={!person.emails.length}>
        <option value="">{person.emails.length ? "Choose an address to review" : "No email found"}</option>
        {person.emails.map((email) => <option key={email.address} value={email.address}>{email.address} · {email.verification.replace("_", " ")}</option>)}
      </select>
      {selected && selected.verification !== "valid" && <p className="draft-recipient-note">This address is marked {selected.verification.replace("_", " ")}. It is not confirmed deliverable; review it before contacting anyone.</p>}
      <label htmlFor={`${id}-subject`}>Subject</label>
      <input id={`${id}-subject`} value={subject} onChange={(event) => { setSubject(event.target.value); setFeedback(""); }} />
      <label htmlFor={`${id}-body`}>Message</label>
      <textarea id={`${id}-body`} rows={15} value={body} onChange={(event) => { setBody(event.target.value); setFeedback(""); }} />
      <div className="draft-actions">
        {canOpenGmail
          ? <a className="gmail-compose" href={gmailUrl.toString()} target="_blank" rel="noopener noreferrer">Open in Gmail <span aria-hidden="true">↗</span></a>
          : <button type="button" disabled aria-describedby={`${id}-gmail-hint`}>Open in Gmail ↗</button>}
        <button type="button" onClick={() => copy(subject, "Subject")} disabled={!subject.trim()}>Copy subject</button>
        <button type="button" onClick={() => copy(body, "Message")} disabled={!body.trim()}>Copy message</button>
      </div>
      <p id={`${id}-gmail-hint`} className="draft-hint">{!recipient ? "Choose a recipient to open this draft in Gmail. " : ""}{hasPlaceholders ? "Replace placeholders such as [Your name] first. " : ""}Opens a Gmail compose window in a new tab. Check the sending account, recipient, and message there before clicking Send. Nothing is sent by this app.</p>
      <p className="draft-feedback" role="status" aria-live="polite">{feedback}</p>
    </section>
  );
}
