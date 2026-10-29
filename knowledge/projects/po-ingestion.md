---
id: po-ingestion
title: "L&T Excel-to-PO ingestion"
summary: Manual onboarding and data entry from complex Excel documents created an ingestion bottleneck and increased the chance of mapping errors.
stack: [TypeScript, NestJS, MongoDB]
defaultBranch: main
readmeSync: false
skillIds: [typescript, nestjs, mongodb]
evidenceIds: [experience-venwiz]
pillar: backend
narrativeOrder: 12
visibility: public
---
> **Context:** Venwiz Technologies / MMT professional workstream. See `experience/venwiz.md`.
# Excel-based Purchase Order ingestion

## Problem

Manual onboarding and data entry from complex Excel documents created an ingestion bottleneck and increased the chance of mapping errors.

## Work described

The owner describes an end-to-end TypeScript/Node.js/NestJS and MongoDB pipeline for L&T that:
- Parsed complex Excel documents.
- Mapped and created Purchase Orders.
- Applied an auto-lock after import.

The stated goals were to reduce onboarding effort and preserve data integrity.

## Engineering considerations

A robust ingestion workflow needs to distinguish parsing from validation and persistence. Common areas to explain in an interview include:
- Mapping spreadsheet columns and business fields.
- Validating required fields and acceptable values.
- Handling malformed rows and missing data.
- Avoiding duplicate creation on repeated imports.
- Reporting errors clearly enough for the operator to correct source files.
- Applying the post-import lock only after the relevant import conditions are satisfied.

These are relevant design considerations; unless separately confirmed, do not claim that every listed safeguard was implemented.

## Safe interview explanation

“I worked on a TypeScript/NestJS and MongoDB ingestion pipeline that parsed complex Excel files, mapped the data into purchase orders, created the records, and triggered an auto-lock after import. The goal was to reduce manual onboarding work while maintaining data integrity.”

## Details requiring owner confirmation

- Excel parsing library and supported formats.
- Whether the pipeline supported partial success or all-or-nothing import.
- Duplicate detection / idempotency strategy.
- Validation and error-reporting behavior.
- Exact definition and timing of “auto-lock.”
- Measured reduction in onboarding time, if any.

---

## Expanded source context from the owner-provided mock-interview knowledge base

The following material preserves the relevant source section's terminology and detail. The source itself describes its content as a structured reconstruction rather than a verbatim transcript.

# 5. Excel-Based Purchase Order Ingestion for L&T

## 5.1 Problem

I worked on an ingestion pipeline for L&T-related workflows that automated purchase-order creation from complex Excel documents.

Manually extracting and mapping information from spreadsheets can be time-consuming and error-prone, particularly when a spreadsheet contains multiple fields that must correspond to existing business entities.

The goal was to automate the transition from spreadsheet input to structured purchase-order records.

## 5.2 Implementation

The pipeline parsed Excel documents, extracted the relevant information, mapped it to the required business entities, and automated purchase-order creation.

My recorded responsibilities included:

- Parsing complex Excel structures.
- Mapping extracted information to purchase orders.
- Automating purchase-order creation.
- Automatically locking records after import.

The post-import locking behavior is important because ingestion is not only about creating records. It also involves controlling what happens after a successful import.

## 5.3 Trade-offs and engineering considerations

Automation reduces repetitive manual work, but it increases the importance of input validation and failure handling.

A production ingestion pipeline must account for malformed spreadsheets, missing fields, invalid mappings, duplicate imports, and partially successful operations.

The lock-after-import behavior also creates a trade-off: it can protect the integrity of imported records, but any correction workflow must be designed appropriately.

These are the relevant engineering considerations for this class of system. The available notes establish the parsing, mapping, automated creation, and post-import locking behavior; they do not specify every validation rule or the exact implementation of rollback and duplicate detection.

---
