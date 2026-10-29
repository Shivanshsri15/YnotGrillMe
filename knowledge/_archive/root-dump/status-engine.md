---
document_type: experience_detail
schema_version: 1
owner: Shivansh Srivastava
organization: Venwiz Technologies
feature: Status Intelligence Engine / statusData v2
verification_status: owner_review_required
---

# Status Intelligence Engine — statusData v2

## Problem

Purchase-order status and risk figures were calculated in duplicated logic across API and cron services. Divergent status vocabularies and logic could produce inconsistent values for the same business record.

## Work described

The owner describes re-architecting this pipeline in TypeScript, NestJS, and MongoDB into a single deterministic, IST-pinned engine and unifying the `statusData` contract across five servers.

The stated result was the elimination of status drift between those paths.

## Key engineering ideas

- **One source of business logic:** centralizing the computation reduces the chance that separate services implement subtly different rules.
- **Stable contract:** consumers use the same `statusData` structure rather than mapping inconsistent status vocabularies independently.
- **Explicit timezone handling:** pinning the business-time interpretation to IST avoids results that vary with server timezone or implicit date conversion.
- **Determinism:** the same inputs and time assumptions should produce consistent business status/risk outputs.

## Trade-offs

Centralizing logic improves consistency but introduces a shared dependency: consumers need to use the common engine and contract correctly. Timezone handling must also be explicit about the difference between an instant in time and a business calendar date.

## Safe claim

“Unified status and risk computation into a deterministic, IST-pinned engine and standardized the `statusData` contract across five servers.”

Do not add latency improvements, percentage error reduction, or throughput figures without evidence.

## Interview follow-up areas

- How status categories and risk values were defined.
- How IST was applied to date boundaries and scheduled jobs.
- How backward compatibility was handled across five consumers.
- What tests protected consistency.
- How deployment was coordinated across services.

---

## Expanded source context from the owner-provided mock-interview knowledge base

The following material preserves the relevant source section's terminology and detail. The source itself describes its content as a structured reconstruction rather than a verbatim transcript.

# 4. Status Intelligence Engine and Cross-Service Consistency

## 4.1 The problem

My professional history includes work on the status-processing pipeline, referred to as the statusData v2 or Status Intelligence Engine.

The problem involved status inconsistencies across multiple backend servers.

When similar business information is processed independently by multiple services, differences in logic or time handling can cause the same record to be interpreted differently.

These discrepancies are particularly problematic in enterprise workflows because different screens or services may present conflicting states for the same underlying process.

## 4.2 Architectural decision: one deterministic engine

The status pipeline was reworked into a single deterministic engine with IST-pinned time handling and a unified statusData contract across five servers.

The design aimed to centralize status computation and standardize how the resulting status data was represented.

The important choices were:

1. **Centralized computation:** reduce duplicated or divergent status logic.
2. **Determinism:** make status computation consistent for equivalent inputs.
3. **Explicit time handling:** pin the relevant processing logic to Indian Standard Time.
4. **Unified contract:** ensure multiple servers consumed a consistent statusData structure.

## 4.3 Why explicit time handling matters

Date and time handling can create subtle bugs.

The same timestamp may be interpreted differently if systems rely on inconsistent time zones, implicit conversions, or different boundary conditions.

For example, a milestone's status could differ if one service evaluates a deadline in UTC and another interprets it in local time.

Explicitly pinning the relevant logic to IST helps establish a consistent business-time interpretation.

A broader lesson is that deterministic processing requires controlling not only the algorithm but also its inputs and environmental assumptions.

## 4.4 Trade-off

Centralizing logic improves consistency, but it also creates a dependency on a common implementation and contract.

Changes to the shared logic must be managed carefully because multiple services depend on it.

A unified contract also requires discipline around compatibility: changing a field or its meaning can affect every consumer.

The documented outcome of this work was to unify the statusData contract across five servers and eliminate the status drift that had motivated the rework.

---
