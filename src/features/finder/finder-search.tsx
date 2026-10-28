"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import type { FinderResponse } from "@/server/finder/types";
import { useRouter } from "next/navigation";
import { useWorkspace } from "./workspace-context";

export function FinderSearch() {
  const router = useRouter();
  const { fields, setFields, result, setResult, searchContext, setSearchContext, openDraft } = useWorkspace();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);

  function compose(personIndex: number, address: string) {
    if (!result) return;
    const id = openDraft(result.people[personIndex], searchContext.firstName, searchContext.company, address);
    router.push(`/draft/${id}`);
  }

  function update(field: keyof typeof fields, value: string) {
    setFields((previous) => ({ ...previous, [field]: value }));
    setError("");
  }

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    setError("");

    if (!fields.firstName.trim() || !fields.lastName.trim() || !fields.company.trim()) {
      setError("Enter a first name, last name, and company.");
      return;
    }

    setResult(null);
    setSearchContext({ ...fields });
    submitting.current = true;
    setPending(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 40_000);
    try {
      const params = new URLSearchParams({ name: `${fields.firstName.trim()} ${fields.lastName.trim()}`, company: fields.company.trim() });
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
    <section id="find-recruiter" className="finder" aria-labelledby="finder-title">
      <div className="section-heading">
        <div><p className="eyebrow">PEOPLE SEARCH</p><h2 id="finder-title">Find a recruiter</h2></div>
        <span>01 / Find an email</span>
      </div>
      <form onSubmit={search} aria-busy={pending}>
        <fieldset className="finder-fields" disabled={pending}>
          <legend className="sr-only">Recruiter search details</legend>
          <label>First name<input name="firstName" autoComplete="off" required maxLength={100} placeholder="e.g. Jane" value={fields.firstName} onChange={(event) => update("firstName", event.target.value)} /></label>
          <label>Last name<input name="lastName" autoComplete="off" required maxLength={100} placeholder="e.g. Doe" value={fields.lastName} onChange={(event) => update("lastName", event.target.value)} /></label>
          <label>Company<input name="company" type="text" required maxLength={253} placeholder="Company name or website" aria-describedby="company-hint" value={fields.company} onChange={(event) => update("company", event.target.value)} /></label>
          <button className="search-button" type="submit">{pending ? "Searching…" : "Find work email"}<span aria-hidden="true">{pending ? "…" : "→"}</span></button>
        </fieldset>
        <p className="company-hint" id="company-hint">Enter a company name or its website. Using the exact website helps narrow your search.</p>
        <p className="finder-disclosure">Searches may use Hunter credits. Website-based searches can return unverified guesses. No email is sent.</p>
      </form>
      {!result && !pending && !error && <p className="finder-empty">Your results will appear here, with the source and verification status.</p>}
      <div aria-live="polite" role="status">{pending && <p className="search-status">Looking for recruiter information…</p>}</div>
      {error && <p className="search-error" role="alert">{error}</p>}
      {result && <div className="finder-results">
        <div className="section-heading"><h3 role="status" aria-live="polite">{result.outcome === "failed" ? "Search could not be completed" : result.people.length ? result.provider === "pattern_guess" ? "Possible email patterns" : "Recruiter information" : "No information found"}</h3><span>{result.provider === "hunter" ? "Source: Hunter" : result.provider === "public_profile" ? "Source: public LinkedIn page" : "Source: pattern guesses"}</span></div>
        {result.provider === "pattern_guess" && result.people.length > 0 && <p className="result-warning">These addresses are guesses, not confirmed mailboxes.</p>}
        {result.notes.length > 0 && <ul className="result-notes">{result.notes.map((note, index) => <li key={index}>{note}</li>)}</ul>}
        {result.people.length > 0 && <p className="results-context">Results for {searchContext.firstName} {searchContext.lastName} · {searchContext.company}</p>}
        {result.people.map((person, index) => <article className="email-result" key={index}>
          <h4>{person.name}</h4>
          {person.company && <p><strong>Company:</strong> {person.company}</p>}
          {person.title && <p>{person.title}</p>}
          {!person.emails.length && <p>No email available.</p>}
          <ul className="email-list">{person.emails.map((email) => <li key={email.address}>
            <button type="button" className="email-result-link" onClick={() => compose(index, email.address)} aria-label={`Write an email to ${person.name} at ${email.address}`}>
              <span className="email-address">{email.address}</span><span className="email-link-action">Write email <span aria-hidden="true">↗</span></span>
            </button>
            <span className="verification">{email.verification.replace("_", " ")}{email.verifiedAt && ` · checked ${email.verifiedAt.slice(0, 10)}`}</span>
          </li>)}</ul>

        </article>)}
      </div>}
    </section>

  );
}
