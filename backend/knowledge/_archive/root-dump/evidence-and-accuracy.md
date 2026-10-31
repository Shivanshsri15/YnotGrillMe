---
document_type: evidence_policy
schema_version: 1
owner: Shivansh Srivastava
verification_status: active_policy
---

# Evidence, accuracy, and claim boundaries

## Source hierarchy

1. **Owner-supplied resumes:** support the claims and dates written in those resumes, but are self-reported rather than independently verified.
2. **Owner-supplied structured mock-interview transcript:** supports the detailed explanations and trade-offs recorded there. It is explicitly a structured reconstruction, not a verbatim transcript.
3. **Repository links:** provide places to inspect code, but a link alone does not prove feature completeness, deployment status, or ownership.
4. **Inference/general engineering context:** useful for explaining why a design matters, but must be labeled as reasoning or a possible improvement rather than a historical fact.

## Important accuracy rules

- Dates in the supplied resumes say Venwiz: August 2025–September 2026. Verify before publication if the dates changed or the role title needs correction.
- The owner is expected to graduate in 2027; do not say the degree is completed.
- AWS Solutions Architect Associate preparation is reported; certification completion is not.
- Do not claim exact-once synchronization. A client queue alone cannot guarantee exactly-once effects.
- Offline conflict handling is described as timestamp-based. Explicit record versioning/optimistic concurrency was discussed as a potential improvement, not confirmed as implemented.
- Stable operation IDs and atomic backend deduplication are important idempotency concepts, but do not claim a complete implementation unless confirmed.
- `statusData` v2 is described as unifying a deterministic, IST-pinned engine across five servers.
- 10+ scheduled jobs is a resume claim. The “hundreds of hours saved” statement is not accompanied by a measurement method.
- The PReCision “8.5–9/10 detection accuracy” figure is a resume claim without evaluation details in the available material.
- Security remediation contributed to an A+ security grade and VAPT certification according to the resume; do not claim sole ownership of the outcome.
- Do not infer direct personal work with every customer named in the resumes.
- Do not claim a particular framework/library is used in a feature unless the source specifies it.
- Do not invent feature lists for repositories that have not been reviewed source-by-source.
- Do not expose confidential employer information, production credentials, personal customer data, private prompts, or internal datasets.

## Known discrepancies / review items

1. **Hackathon ranking discrepancy:** earlier profile context records Hackoverse ’24 Top 5 and Webathon ’24 Top 8; another mock-interview note reportedly mentions “top five and top three.” Preserve the discrepancy and ask the owner which event/ranking the second phrase refers to before publishing it.
2. **PReCision accuracy:** reported 8.5–9/10 score requires definition of metric, sample, and evaluation method.
3. **Impact metrics:** onboarding time reduction and “hundreds of hours” saved need a measurement basis if used publicly.
4. **Repository completeness:** Airline Reservation System, QuirkyPost, TwitterCloneV1, and EcommercePlatformV1 require source review before detailed claims.
5. **Project technology lists:** confirm which AAHAAR blockchain/IPFS components are integrated and working end-to-end.
6. **Contact privacy:** phone number appears in resumes but is intentionally omitted from public knowledge-base content. Owner approval is required to publish it.
7. **Scheduling:** no booking/scheduling URL has been supplied; do not invent one.

## How the AI profile should respond when uncertain

Use language such as:
- “The available profile says…”
- “The supplied resume reports…”
- “The implementation detail is not documented in the current knowledge base.”
- “That was discussed as a possible improvement, not confirmed as implemented.”
- “I can describe the project at a high level, but I would need the repository/code or owner confirmation to be precise.”

Do not fill a gap with plausible-sounding detail.


---

## Source-specific confidence map

| Claim family | Primary evidence | Confidence / caveat |
|---|---|---|
| Education and expected graduation | Three supplied resumes | Strong as owner-supplied data; degree is in progress, expected 2027 |
| Venwiz role and date range | Three supplied resumes and mock-interview transcript | Strong consistency across materials; exact HR dates should be confirmed if a formal background check requires them |
| 10+ scheduled/event-driven pipelines | Resumes | Resume-reported; “hundreds of hours” has no calculation method in the provided files |
| Five-server statusData contract | Resumes and transcript | Consistent claim; no extra performance metric provided |
| Offline-first app and sync behavior | Resumes and detailed transcript | Detailed source support; exact storage library and end-to-end idempotency guarantee are unspecified |
| HawkAI/Workspace Insights | AI/full-stack resumes and transcript | Architecture described; exact agent graph, permissions implementation, and evaluation are not fully specified |
| PReCision stack and architecture | Resume, transcript, prior repository notes | Project description supported; detection accuracy lacks benchmark methodology |
| QuirkyPost features | Owner's public LinkedIn post | First-party feature description; current repository state not fully re-verified in this refresh |
| Stock Picker Agent internals | Public GitHub README | README-level detail available; README states short-term/entity RAG memory is commented, not active |
| Other small repositories | Prior repository inventory only | Insufficient source evidence for detailed feature claims |
| Hackathon outcomes | Prior profile's GitHub profile review notes and resume/cover-letter context | Hackoverse '24 Top 5 and Webathon '24 Top 8 appear in cover-letter material; separate transcript phrasing says “top five and top three,” so preserve discrepancy until owner clarifies |
| AWS certification | Resume/cover-letter text | Preparation is confirmed; no completed certification claim |

## Discrepancy handling

The earlier mock-interview summary includes a statement about hackathon results reaching “top five and top three.” The previous profile inventory records Hackoverse '24 Top 5 and Webathon '24 Top 8. Cover-letter material also uses Top 5 and Top 8. Do not silently rewrite the “top three” mention as Top 8; retain the discrepancy for owner review. The safest public claim is to omit the ambiguous ranking until clarified, or use the explicitly named event/ranking from a source the owner confirms.

## External-source retrieval limits

The current refresh successfully inspected the Stock Picker Agent GitHub README and a public LinkedIn post about QuirkyPost. Direct retrieval of the supplied LinkedIn profile page and several GitHub repository pages was limited by web cache/access behavior. Prior profile material contains repository-review notes for PReCision, PReCision-Fe, AAHAAR, and the four smaller repositories; this delivery retains those notes as prior research rather than falsely stating every page was freshly inspected now.
