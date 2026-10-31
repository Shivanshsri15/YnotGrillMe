---
id: access-control
title: UAC / RBAC access control
summary: "The supplied resumes state that Shivansh was a core contributor to platform-wide UAC/RBAC architecture, enabling granular role- and permission-based access across SaaS features."
stack: [TypeScript, NestJS]
defaultBranch: main
readmeSync: false
skillIds: [typescript, nestjs, rbac]
evidenceIds: [experience-venwiz]
pillar: platform
narrativeOrder: 22
visibility: public
---
> **Context:** Venwiz Technologies / MMT professional workstream. See `experience/venwiz.md`.
# User access control and vendor onboarding

## Access control

The supplied resumes state that Shivansh was a core contributor to platform-wide UAC/RBAC architecture, enabling granular role- and permission-based access across SaaS features.

Safe language: **“Core contributor to platform-wide UAC/RBAC architecture.”** Do not claim sole architecture ownership.

## Vendor onboarding model

The broader interview notes mention a company/grouped-user model for vendor onboarding and access across purchase orders, comments, emails, and reports. This is useful context, but the exact schema and enforcement paths need owner confirmation before being described as a complete implementation specification.

## General engineering considerations

For role- and permission-based access, authentication alone is insufficient: a valid identity does not automatically have permission to access a particular resource. Authorization should be enforced server-side at relevant resource boundaries, including indirect routes such as exports and background jobs.

The transcript includes interview discussion of multi-tenant authorization, HTTP 401 versus 403, decorators versus guards, and time-of-check/time-of-use concerns. Those discussions should be treated as conceptual interview preparation unless tied to a confirmed production implementation.

## Details to confirm

- Exact role hierarchy and permission representation.
- Whether permissions are inherited, scoped by organization/group, or both.
- Enforcement points for APIs, reports, emails, and AI workflows.
- Vendor-company/group membership schema.
- Audit logging and permission-change behavior.

---

## Expanded source context from the owner-provided mock-interview knowledge base

The following material preserves the relevant source section's terminology and detail. The source itself describes its content as a structured reconstruction rather than a verbatim transcript.

# 8. User Access Control and Vendor Onboarding

## 8.1 User access control

I contributed to the architecture of the platform's user access-control system, including role and permission design.

The goal of such a system is to determine which users can perform which actions on which resources.

This requires more than checking whether a user is authenticated.

Authentication answers who the user is. Authorization determines what that user is allowed to do.

A robust authorization system must also consider the ownership and scope of the resource being accessed.

## 8.2 Vendor onboarding architecture

My recorded work included reworking vendor onboarding around a company and its grouped users across purchase orders, comments, emails, and reports.

This reflects a data-modeling challenge: a vendor company may have multiple users, and those users need to interact with the same company-related workflows without losing the correct organizational boundaries.

The architecture must maintain a consistent relationship between the company, its users, and the resources those users can access.

## 8.3 Engineering implications

A centralized access-control model can reduce duplicated permission logic, but it must be applied consistently across all relevant entry points.

Checking permissions on one API while forgetting another API, report export, or background process can create an authorization gap.

Similarly, vendor onboarding cannot be treated as a form-submission problem alone. The resulting company-user relationships influence authorization and resource ownership throughout the product.

The available notes establish that I co-architected the access-control approach and reworked vendor onboarding across several workflows. They do not establish that every possible authorization edge case was solved by a single centralized policy engine.

---
