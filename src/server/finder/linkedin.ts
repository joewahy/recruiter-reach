import { FinderInputError } from "./types.ts";

/** Parse a public profile URL; never request the URL or infer identity from its slug. */
export function linkedinHandle(raw: string): string {
  try {
    const url = new URL(raw.trim());
    const match = /^\/in\/([^/]+)\/?$/.exec(url.pathname);
    if (url.protocol !== "https:" || !/^(www\.|[a-z]{2}\.)?linkedin\.com$/.test(url.hostname) || url.port || url.username || url.password || !match) throw new Error();
    const handle = decodeURIComponent(match[1]);
    if (!/^[\p{L}\p{N}_-]{1,200}$/u.test(handle)) throw new Error();
    return handle;
  } catch {
    throw new FinderInputError("Enter a LinkedIn profile URL such as https://www.linkedin.com/in/jane-doe.");
  }
}
