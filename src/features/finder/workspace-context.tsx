"use client";

import { createContext, useContext, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { FinderResponse, FoundPerson } from "@/server/finder/types";
import { createEmailDraft } from "./recruiter-email-draft";
import type { EmailDraft } from "./recruiter-email-draft";

type SearchFields = { firstName: string; lastName: string; company: string };
type DraftEntry = { id: string; person: FoundPerson; originalRecipient: string; draft: EmailDraft };
type Workspace = {
  fields: SearchFields;
  setFields: Dispatch<SetStateAction<SearchFields>>;
  searchContext: SearchFields;
  setSearchContext: Dispatch<SetStateAction<SearchFields>>;
  result: FinderResponse | null;
  setResult: Dispatch<SetStateAction<FinderResponse | null>>;
  drafts: Record<string, DraftEntry>;
  openDraft: (person: FoundPerson, firstName: string, company: string, address: string) => string;
  updateDraft: (id: string, draft: EmailDraft) => void;
};

const Context = createContext<Workspace | null>(null);
const emptyFields: SearchFields = { firstName: "", lastName: "", company: "" };

/** Shared only for this tab's client-side navigation; no mailbox or persistent storage. */
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [fields, setFields] = useState(emptyFields);
  const [searchContext, setSearchContext] = useState(emptyFields);
  const [result, setResult] = useState<FinderResponse | null>(null);
  const [drafts, setDrafts] = useState<Record<string, DraftEntry>>({});

  function openDraft(person: FoundPerson, firstName: string, company: string, address: string) {
    const existing = Object.values(drafts).find((entry) => entry.originalRecipient === address && entry.person.name === person.name);
    if (existing) return existing.id;
    const id = crypto.randomUUID();
    setDrafts((previous) => ({ ...previous, [id]: { id, person, originalRecipient: address, draft: createEmailDraft(person, firstName, company, address) } }));
    return id;
  }

  function updateDraft(id: string, draft: EmailDraft) {
    setDrafts((previous) => previous[id] ? { ...previous, [id]: { ...previous[id], draft } } : previous);
  }

  return <Context.Provider value={{ fields, setFields, searchContext, setSearchContext, result, setResult, drafts, openDraft, updateDraft }}>{children}</Context.Provider>;
}

export function useWorkspace() {
  const context = useContext(Context);
  if (!context) throw new Error("WorkspaceProvider is required.");
  return context;
}
