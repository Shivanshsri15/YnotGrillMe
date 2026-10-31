---
id: venwiz
company: Venwiz Technologies
role: Software Engineer Intern
dates: August 2025 — September 2026
summary: "Full Venwiz/MMT narrative in progressive order: HawkAI → statusData v2 → offline-first mobile → L&T ingestion → scheduled pipelines → cross-platform/UAC → ownership & mentoring."
skillIds: [typescript, nestjs, mongodb, react-native, pipelines, rbac, google-adk]
visibility: public
---
# Venwiz Technologies — MMT engineering experience

## Role and context

- **Role:** Software Engineer Intern (supplied resumes).
- **Dates:** August 2025–September 2026 · Bengaluru.
- **Company:** VC-funded B2B SaaS · Product: Manufacturing Milestone Management Tool (MMT).

When the visitor asks what I built / my Venwiz experience / my background there, answer with the **Progressive experience narrative** below in order. Speak in first person. Keep the technical richness — stack, architecture moves, and outcomes that are documented. Do not invent metrics beyond what is written here.

## Progressive experience narrative (canonical overview)

Use these bullets as the overview answer unless the visitor asks about one thread only.

• **[AI Expediting Layer – HawkAI]** Executives and expeditors could not assess portfolio-wide risk without manually scanning hundreds of POs; built Workspace Insights, a permission-aware AI analytics pipeline using TypeScript, NestJS, MongoDB, AWS S3, Google ADK and LLM APIs. It combines deterministic signal extraction from MongoDB with multi-agent LLM synthesis (supervisor + deep-analysis agents) over S3-materialized expediting bundles, delivering ranked Priority Alerts and Root Cause Insights. See `workspace-insights-hawkai.md`.

• **[Status Intelligence Engine – statusData v2]** Eliminated conflicting PO risk/status figures from duplicated logic and divergent status vocabularies across API and cron services; re-architected the pipeline (TypeScript, NestJS, MongoDB) into a single deterministic, IST-pinned engine and unified the statusData contract across 5 servers, ending status drift. See `status-engine.md`.

• **[Offline-First Mobile Application]** Architected and built MMT's complete offline-first mobile app with React Native, Expo and TypeScript, using an endpoint-addressable key-value architecture to materialize user data locally and stay synced with online state. Engineered a fault-tolerant sync engine (queue-based processing, change tracking, retries, conflict resolution, background batching) so expediting teams can update manufacturing plans in low-connectivity environments. Solely owned productionization, releases and deployment via Expo/EAS. See `offline-first-mobile.md` and `production-support.md`.

• **[L&T Automation & Data Ingestion]** Eliminated manual data-ingestion bottlenecks for L&T with an end-to-end TypeScript (Node.js/NestJS) and MongoDB pipeline that parses complex Excel documents, auto-creates and maps Purchase Orders, and triggers an auto-lock after import, reducing onboarding time and ensuring strict data integrity. See `po-ingestion.md`.

• **[Automated Scheduled Pipelines]** Kept stakeholder dashboards current across enterprise clients (Primetals, L&T, Thermax, Zeeco, JNK, FLSmidth) by designing and maintaining 10+ JavaScript cron jobs and event-driven pipelines for Google Sheets sync, multi-dimensional product analytics and automated delay detection with alerts. Resume-reported time savings exist; do not invent a precise hour count unless confirmed. See `scheduled-pipelines.md`.

• **[Cross-Platform Architecture & Feature Ownership]** Solely productionized cross-platform features across web and mobile, including a rich-text commenting system that sanitizes remarks to HTML in real time (mitigating XSS) and preserves formatting across UI, DB, Excel reports, emails and agentic workflows. Core contributor to the platform-wide UAC/RBAC architecture enabling granular role- and permission-based access. See `rich-text-security.md` and `access-control.md`.

• **[Product Ownership & Engineering Leadership]** Managed and mentored 2 software engineering interns through code reviews and feature ownership; joined production on-call rotations resolving critical issues. Led remediation of vulnerabilities and reliability issues found in Astra's security assessment, contributing to an A+ security grade and VAPT certification (contribution language — not sole ownership of the certification). See `production-support.md`.

## Narrative lanes (for retrieval / suggestions)

1. **AI:** HawkAI  
2. **Backend:** statusData v2, L&T PO ingestion, scheduled pipelines, rich-text security  
3. **Platform:** offline-first mobile + EAS ownership, UAC/RBAC, mentoring / on-call / security remediation  

## Enterprise/customer wording

Named clients appear in resumes for context. Do not imply each customer used every feature, or direct personal customer ownership, unless confirmed.

## Boundaries

- Based on owner-supplied resumes and structured interview notes — not independent employer verification.
- Omit unlisted metrics. “Hundreds of hours saved” is resume-reported; prefer qualitative wording unless measurement details are supplied.
- Future ideas must not be stated as shipped.
