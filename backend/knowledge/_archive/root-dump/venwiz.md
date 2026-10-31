---
document_type: experience
schema_version: 1
owner: Shivansh Srivastava
organization: Venwiz Technologies
product: Manufacturing Milestone Management Tool (MMT)
verification_status: owner_review_required
---

# Venwiz Technologies — MMT engineering experience

## Role and context

- **Role:** Software Engineer Intern, as stated in supplied resumes.
- **Dates:** August 2025–September 2026.
- **Location in resume:** Bengaluru.
- **Company context:** VC-funded B2B SaaS startup.
- **Product:** Manufacturing Milestone Management Tool (MMT), supporting enterprise manufacturing/industrial workflows.

The work spanned backend services, data ingestion, scheduled automation, mobile field operations, cross-platform features, access control, applied AI analytics, production releases, and support.

## Main contributions

1. **Offline-first mobile app:** built with React Native, Expo, and TypeScript; included local data materialization and a queue-based synchronization engine for low-connectivity field environments. See `offline-first-mobile.md`.
2. **L&T Excel-to-PO ingestion:** parsed complex Excel files, mapped/created purchase orders, and applied an auto-lock after import. See `po-ingestion.md`.
3. **Scheduled and event-driven pipelines:** designed and maintained 10+ jobs for Google Sheets sync, analytics, delay detection, and alerts. See `scheduled-pipelines.md`.
4. **Status Intelligence Engine / statusData v2:** consolidated status/risk logic into one deterministic, IST-pinned engine and unified the `statusData` contract across five servers. See `status-engine.md`.
5. **Workspace Insights / HawkAI:** permission-aware AI analytics combining deterministic signals from MongoDB with multi-agent LLM synthesis over S3-materialized expediting bundles. See `workspace-insights-hawkai.md`.
6. **Rich-text comments:** sanitized rich text to HTML and preserved formatting across UI, database, Excel reports, emails, and AI workflows. See `rich-text-security.md`.
7. **UAC/RBAC:** contributed to platform-wide role- and permission-based access control. See `access-control.md`.
8. **Productionization, security, and mentoring:** owned mobile releases/deployment via Expo/EAS, participated in on-call, remediated assessment findings, and mentored two interns. See `production-support.md`.

## Enterprise/customer wording

Supplied resumes mention clients or enterprise contexts including TATA, Nestlé, L&T, ITC, Adani, Godrej, Primetals, Thermax, Zeeco, JNK, and FLSmidth. A separate resume bullet associates scheduled pipelines with Primetals, L&T, Thermax, Zeeco, JNK, and FLSmidth. Do not imply that each customer used every feature, or that Shivansh personally worked directly with all named companies unless confirmed.

## Engineering identity demonstrated by this work

- Turning operational pain points into software workflows.
- Handling integration and data consistency across services and output surfaces.
- Balancing local responsiveness with eventual synchronization.
- Combining deterministic business logic with LLM synthesis where useful.
- Considering permissions and sanitization in user-facing and AI-enabled flows.
- Owning delivery beyond implementation, including release and production support.

## Boundaries and caveats

- The experience summary is based on owner-supplied resumes and a structured mock-interview transcript, not an independent employer verification.
- The transcript is a structured reconstruction rather than a verbatim transcript.
- Any unlisted performance metric or quantified business impact should be omitted unless separately confirmed.
- Technical improvements discussed as future options must not be presented as already implemented.
