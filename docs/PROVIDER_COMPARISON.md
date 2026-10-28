# LinkedIn URL lookup: provider comparison

Checked October 27, 2026. Prices below are advertised USD monthly prices, not account-specific quotes. No provider was purchased, connected, or selected by this comparison. Coverage of the user's example profiles has not been verified with any of these providers.

## Current diagnosis

The existing UI accepts only a LinkedIn profile URL. Hunter Email Finder and a separately tested Hunter enrichment request both returned no match for `kendraansotigue`; the public read tested from this environment returned HTTP 999.

The user subsequently confirmed that a successful public structured-data read returning **Hillary Lundberg**, with no email, came from Hillary's own LinkedIn URL. Profile extraction worked for that request; email discovery did not. This is not evidence of a wrong-person bug, nor evidence that the Kendra URL became accessible.

Public profile parsing and work-email discovery are different capabilities. A name-only result is not an email lookup success. A different data provider can improve coverage, but cannot guarantee that any particular person's email is available.

## Shortlist

| Provider | URL-only workflow | Free testing | Published paid example | Main tradeoff |
| --- | --- | --- | --- | --- |
| Findymail | Business-profile email endpoint accepts `linkedin_url` directly | 10 trial credits | Displayed Starter plan: $99/month for 5,000 Finder credits; API access included | Most direct email-oriented integration; small free test allowance |
| Datagma | Enrich a social-profile URL; then use its email finder with resolved identity/company if needed | 100 email credits/month; API access listed on Free | Regular: $49/month for 3,000 credits; $39/month equivalent billed yearly | Larger advertised free email allowance, but confirm total credit usage for the profile-enrichment-plus-email workflow |
| People Data Labs | Person Enrichment matches social profiles and returns identity/employment fields | Up to 100 records/month; contact details obfuscated | Pro starts at $98/month for 350 records | Useful for testing name/company coverage; free plan cannot supply usable emails |

Findymail's currently rendered pricing page displays the 5,000-credit selection. This report does not claim that $99 is the cheapest available volume selection. Confirm the chosen volume and checkout price before subscribing.

## Billing details that affect comparison

- Findymail's business-profile endpoint lists one Finder credit when an email is found, zero when none is found, for credit-based plans. At the displayed $99 / 5,000 allowance, fully using the allowance is about $0.0198 per successful email. This is a calculated allowance cost, not pay-as-you-go pricing or a guarantee of 5,000 matches.
- Datagma advertises one credit per verified email. Its profile-enrichment step may have separate billing; confirm this in the account before treating an end-to-end URL lookup as one credit. Catch-all results have separate vendor treatment and must not be labeled guaranteed deliverable in our app.
- PDL typically charges one enrichment credit per successful record match. Paying for a person record does not guarantee a work email is populated. At its minimum monthly plan, $98 / 350 is $0.28 per matched record.

## Recommended evaluation

Test **Findymail's 10 free credits first** because its documented business-profile endpoint directly fits our URL-only email workflow. Also consider Datagma's free API if a larger free test set is important. PDL is a useful identity-enrichment candidate but a less attractive first paid email experiment for this small learning project.

Use the same small set of profile URLs in each trial, including the original failing URL and the URL that returned Hillary. Record whether the returned identity matches the submitted URL, current company, whether a work email exists, vendor verification status, latency, and actual credits consumed. Do not mix guessed addresses with provider-verified results. Choose based on observed coverage and cost; no subscription is necessary just to compare advertised features.

Before implementing a selected service, confirm its API entitlement, permitted app use, output fields, and billing for the exact endpoint. Keep all keys server-side in `.env.local`. No personal-email or phone lookup is part of this evaluation.

## Official sources

- [Findymail pricing](https://www.findymail.com/pricing/) — displayed plan, trial credits, API inclusion.
- [Findymail API reference](https://app.findymail.com/docs/) — business-profile input and endpoint credit rules.
- [Datagma pricing](https://datagma.com/en/pricing) — Free/Regular plans and email credits.
- [Datagma API introduction](https://datagmaapi.readme.io/reference/getting-started-with-your-api) — enrichment and URL-based workflows.
- [Datagma work-email guide](https://datagmaapi.readme.io/reference/find-work-email-address) — profile enrichment first when the name is unknown.
- [PDL person pricing](https://www.peopledatalabs.com/pricing/person) — free contact-data masking and Pro minimum.
- [PDL credit rules](https://support.peopledatalabs.com/hc/en-us/articles/25794271805211-Pricing-credits) — successful-match charging.
- [PDL Person Enrichment](https://docs.peopledatalabs.com/docs/person-enrichment-api) — identity matching API.
