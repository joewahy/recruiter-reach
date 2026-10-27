"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import type { FinderResponse } from "@/server/finder/types";

type SearchFields = { firstName: string; lastName: string; domain: string; linkedinUrl: string };
const emptyFields: SearchFields = { firstName: "", lastName: "", domain: "", linkedinUrl: "" };

export function FinderSearch() {
  const [fields, setFields] = useState<SearchFields>(emptyFields);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<FinderResponse | null>(null);
  const submitting = useRef(false);

  function update(field: keyof SearchFields, value: string) {
    setFields((previous) => ({ ...previous, [field]: value }));
    setResult(null);
    setError("");
  }

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    setError("");
    setResult(null);

    if (!fields.firstName.trim() || !fields.lastName.trim() || !fields.domain.trim()) {
      setError("Enter the recruiter's first name, last name, and company website.");
      return;
    }
    if (fields.linkedinUrl.trim()) {
      try {
        const url = new URL(fields.linkedinUrl.trim());
        if (url.protocol !== "https:" || !/^(www\.|[a-z]{2}\.)?linkedin\.com$/.test(url.hostname) || !/^\/in\/[^/]+\/?$/.test(url.pathname) || url.username || url.password) {
          throw new Error("Invalid profile URL");
        }
      } catch {
        setError("Enter a LinkedIn profile URL such as https://www.linkedin.com/in/jane-doe, or leave it blank.");
        return;
      }
    }

    submitting.current = true;
    setPending(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30_000);
    try {
      // The existing finder takes name + domain. LinkedIn is a reference only;
      // never treat its URL as a company domain or fetch a profile here.
      const params = new URLSearchParams({
        name: `${fields.firstName.trim()} ${fields.lastName.trim()}`,
        domain: fields.domain.trim(),
      });
      const response = await fetch(`/api/find?${params}`, { cache: "no-store", signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Search could not be completed. Try again.");
      setResult(data as FinderResponse);
    } catch (caught) {
      setError(controller.signal.aborted
        ? "Search timed out. Please try again."
        : caught instanceof TypeError
          ? "Could not reach the finder. Check your connection and try again."
          : caught instanceof Error ? caught.message : "Search could not be completed. Try again.");
    } finally {
      window.clearTimeout(timeout);
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <section className="finder" aria-labelledby="finder-title">
      <div className="section-heading">
        <div><p className="eyebrow">START A CONVERSATION</p><h2 id="finder-title">Find a recruiter’s work email</h2></div>
        <span>Search by name and company</span>
      </div>
      <form onSubmit={search} aria-busy={pending}>
        <fieldset className="finder-fields" disabled={pending}>
          <legend className="sr-only">Recruiter search details</legend>
          <label>First name<input name="firstName" autoComplete="off" required maxLength={100} placeholder="Jane" value={fields.firstName} onChange={(event) => update("firstName", event.target.value)} /></label>
          <label>Last name<input name="lastName" autoComplete="off" required maxLength={100} placeholder="Doe" value={fields.lastName} onChange={(event) => update("lastName", event.target.value)} /></label>
          <label className="finder-wide">Company website<input name="domain" type="text" autoCapitalize="none" spellCheck={false} required maxLength={253} placeholder="company.com" aria-describedby="company-hint" value={fields.domain} onChange={(event) => update("domain", event.target.value)} /><small id="company-hint">Use their employer’s website, not linkedin.com.</small></label>
          <label className="finder-wide">LinkedIn profile URL <span className="optional">(optional)</span><input name="linkedinUrl" type="url" autoCapitalize="none" spellCheck={false} maxLength={1000} placeholder="https://www.linkedin.com/in/jane-doe" aria-describedby="linkedin-hint" value={fields.linkedinUrl} onChange={(event) => update("linkedinUrl", event.target.value)} /><small id="linkedin-hint">For your reference only. Search uses the name and company website; it does not read LinkedIn.</small></label>
          <button className="search-button" type="submit">{pending ? "Searching…" : "Search for email"}<span aria-hidden="true">{pending ? "…" : "→"}</span></button>
        </fieldset>
        <p className="finder-disclosure">Hunter lookups may use your plan’s credits. Without a configured key, results are unverified pattern guesses. Nothing is sent.</p>
      </form>
      <div aria-live="polite" role="status">{pending && <p className="search-status">Looking for a work email…</p>}</div>
      {error && <p className="search-error" role="alert">{error}</p>}
      {result && <div className="finder-results" aria-live="polite" aria-atomic="true">
        <div className="section-heading"><h3>{result.outcome === "failed" ? "Search could not be completed" : result.people.length ? result.provider === "pattern_guess" ? "Possible email patterns" : "Email search results" : "No email found"}</h3><span>{result.provider === "hunter" ? "Source: Hunter" : "Source: pattern guesses"}</span></div>
        {result.provider === "pattern_guess" && result.people.length > 0 && <p className="result-warning">These addresses are guesses, not confirmed mailboxes.</p>}
        {result.notes.length > 0 && <ul className="result-notes">{result.notes.map((note, index) => <li key={index}>{note}</li>)}</ul>}
        {result.people.map((person, index) => <article className="email-result" key={index}>
          <h4>{person.name}</h4>
          {person.title && <p>{person.title}</p>}
          <ul className="email-list">{person.emails.map((email) => <li key={email.address}><span className="email-address">{email.address}</span><span className="verification">{email.verification.replace("_", " ")}{email.verifiedAt && ` · checked ${email.verifiedAt.slice(0, 10)}`}</span></li>)}</ul>
        </article>)}
      </div>}
    </section>
  );
}
