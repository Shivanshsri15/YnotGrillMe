---
id: rich-text-security
title: Rich-text comments and XSS mitigation
summary: "Comments needed to preserve formatting across several surfaces: the application UI, database storage, Excel reports, emails, and AI-enabled workflows. Inconsistent conversion could damage formatting or produce different representations. HTML output also creates a cross-site scrip"
stack: [TypeScript]
defaultBranch: main
readmeSync: false
skillIds: [typescript, security]
evidenceIds: [experience-venwiz]
pillar: backend
narrativeOrder: 14
visibility: public
---
> **Context:** Venwiz Technologies / MMT professional workstream. See `experience/venwiz.md`.
# Cross-platform rich-text comments and sanitization

## Problem

Comments needed to preserve formatting across several surfaces: the application UI, database storage, Excel reports, emails, and AI-enabled workflows. Inconsistent conversion could damage formatting or produce different representations. HTML output also creates a cross-site scripting (XSS) risk if untrusted content is rendered unsafely.

## Work described

The supplied resumes describe a rich-text commenting system that sanitizes remarks to HTML in real time and preserves formatting across UI, database, Excel, email, and agentic workflows. Shivansh states that he solely productionized the cross-platform feature.

## Security distinction

Sanitization is not the same as merely escaping strings or trusting editor output. A safe implementation should use a suitable allowlist-based sanitizer for the intended rich-text subset and ensure that each rendering surface treats content appropriately.

The exact library, allowlist, and conversion pipeline are not specified in the available material. Do not claim a particular sanitizer or exhaustive XSS protection without confirmation.

## Safe explanation

“I worked on a cross-platform rich-text comments feature. The challenge was to keep formatting consistent when comments moved between the UI, database, reports, emails, and AI workflows, while reducing XSS risk. The feature sanitized remarks to HTML and kept the representation usable across those surfaces.”

## Follow-up questions to prepare

- Where is sanitization performed: client, server, or both?
- Is HTML the canonical stored form, or is there a separate structured representation?
- Which tags and attributes are allowed?
- How are links and URL schemes validated?
- How do Excel and email outputs escape or transform markup?
- How are legacy comments handled?

---

## Expanded source context from the owner-provided mock-interview knowledge base

The following material preserves the relevant source section's terminology and detail. The source itself describes its content as a structured reconstruction rather than a verbatim transcript.

# 7. Rich-Text Comments, Security, and Cross-System Consistency

## 7.1 Problem

I worked on rich-text comments across web and mobile experiences.

Comments were not isolated pieces of text. Their content needed to be processed and displayed consistently across several parts of the product, including comments, Excel exports, email notifications, reports, and AI-related workflows.

This introduced both rendering and data-consistency challenges.

## 7.2 Implementation responsibilities

My recorded work included:

- Converting rich-text HTML.
- Updating the DOM for appropriate rendering.
- Sanitizing content to address cross-site scripting (XSS) risks.
- Persisting the comment content.
- Maintaining consistency across different output channels.

The work required thinking about the lifecycle of a comment rather than only the editor in which it was created.

A comment that renders correctly in a web browser might not render correctly in an email or report. Similarly, HTML that is acceptable in one rendering context may be unsafe in another.

## 7.3 Security trade-off

Rich text improves usability because users can structure and format their comments. However, rendering user-controlled HTML can introduce security risks.

Sanitization must therefore be applied according to the intended output context.

The broader engineering lesson is that content should not be assumed safe merely because it originated inside an authenticated application. User-generated HTML can still contain dangerous markup or attributes.

The implementation needed to balance formatting flexibility with safe rendering and consistent persistence.

---
