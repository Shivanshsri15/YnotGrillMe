---
document_type: source_register
schema_version: 2
owner: Shivansh Srivastava
last_reviewed: 2026-10-29
verification_status: source_inventory_complete_for_materials_available_in_this_conversation
---

# Source register and provenance

This file records which materials informed the Why Not Grill Me? knowledge base and how claims should be interpreted.

## Owner-supplied primary materials

### 1. Backend-focused resume
- Original file: `shivansh_Srivastava_be(4).pdf`
- Extracted/redacted copy: `sources/resume-backend.txt`
- Main emphasis: backend stack, Venwiz/MNT workstreams, PReCision, AAHAAR, education.

### 2. AI-focused resume
- Original file: `shivansh_srivastava_AI(5).pdf`
- Extracted/redacted copy: `sources/resume-ai.txt`
- Main emphasis: HawkAI/Workspace Insights, agentic AI, RAG/vector search, offline-first mobile, enterprise backend work.

### 3. Full-stack resume
- Original file: `Shivansh_Srivastava_.pdf`
- Extracted/redacted copy: `sources/resume-fullstack.txt`
- Main emphasis: cross-platform development, scheduled pipelines, status engine, access control, AI analytics, mobile delivery.

### 4. Mock-interview knowledge-base transcript
- Original file: `Pasted text(20261028-190518).txt`
- Copy: `sources/mock-interview-transcript.txt`
- The document is explicitly a structured reconstruction based on professional history/mock-interview notes, not a verbatim transcript.
- It provides detailed explanations of offline synchronization, idempotency, timestamp conflict handling, deterministic status processing, Excel ingestion, scheduled jobs, rich text/XSS, UAC/RBAC, production support, PReCision, career direction, and interview coaching topics.

### 5. Previous detailed profile draft
- The previous `profile.md` was 966 lines and approximately 63 KB. It is used as the expanded profile backbone in this version, with a source-provenance update and a duplicated sentence corrected.
- It includes a structured project inventory, profile summaries, skills index, achievements/training claims, portfolio agent instructions, and the transcript's detailed professional context.

## Public sources used or retained from prior review notes

### GitHub profile
https://github.com/Shivanshsri15

The previous profile draft records a review of the profile's public narrative, pinned repositories, hackathon achievements, and training entries. The current refresh could not directly fetch the profile page, so use the detailed profile's recorded claims with their stated caveats and verify certificate/event details before formal publication.

### PReCision backend
https://github.com/Shivanshsri15/PReCision

Prior profile notes describe repository documentation/source review covering GitHub webhook handling, PR diff traversal, AST-aware analysis, repository indexing/retrieval, and specialized review stages. The supplied resumes and transcript also describe NestJS, LangGraph, Gemini embeddings, MongoDB Atlas Vector Search, RAG, incremental indexing, Docker, and Render.

### PReCision frontend
https://github.com/Shivanshsri15/PReCision-Fe

Prior profile notes identify this as the companion web application for GitHub sign-in, repository indexing, and multi-agent PR review; the README was recorded as identifying React 19, Vite, TypeScript, Tailwind CSS v4, and Redux Toolkit async thunks.

### AAHAAR
https://github.com/Shivanshsri15/Aahaar

Prior profile notes describe a surplus-food rescue and tax-benefit platform with frontend/backend/Hardhat directories and a stack including React, Redux, Material UI, Axios, Node.js, Express, JWT, MongoDB/Mongoose, AWS S3, IPFS, Solidity, Hardhat, Ethers, and OpenZeppelin upgradeable contracts. Resume claims about KYC, NGO assignment, delivery tracking, tax APIs, and admin telemetry require current source confirmation.

### Stock Picker Agent
https://github.com/Shivanshsri15/stock_picker_agent

The README was inspected in this refresh. See `sources/github-stock-picker-readme.txt` and `projects/stock-picker-agent.md`. The README says SQLite long-term memory is active and short-term/entity RAG memory is commented.

### QuirkyPost LinkedIn post
https://www.linkedin.com/posts/shivanshsri15_mernstack-quirkypost-bloggingplatform-activity-7283915866037968897-0VRd

Inspected in this refresh. See `sources/linkedin-quirkypost-post.txt` and `projects/quirkypost.md`. It is a first-party feature description, not a code audit.

### Other repositories
- https://github.com/Shivanshsri15/airline-reservation-system
- https://github.com/Shivanshsri15/QuirkyPost
- https://github.com/Shivanshsri15/TwitterCloneV1
- https://github.com/Shivanshsri15/EcommercePlatformV1

Prior profile notes record repository existence and some top-level structure. The current refresh could not fetch all pages. QuirkyPost's feature list is supplemented by the first-party LinkedIn post; Airline Reservation System, TwitterCloneV1, and EcommercePlatformV1 remain pending source-level verification.

## Public links

- LinkedIn profile supplied by owner: https://www.linkedin.com/in/Shivanshsri15
- GitHub profile supplied by owner: https://github.com/Shivanshsri15
- PReCision demo supplied in resumes: https://precision-fe.onrender.com
- AAHAAR demo supplied in resumes: https://aahaar-seven.vercel.app

The LinkedIn profile itself could not be directly retrieved in this refresh. Do not substitute a similarly named profile found in search results.

## Source-use rules

- Resume claims are self-reported and should be attributed as such when necessary.
- First-party social posts are useful project descriptions but not independent code verification.
- A README is documentation, not proof that a demo is live or that every described feature currently works.
- Source code, tests, deployment state, and the owner's account should be checked before publishing stronger claims.
- Do not include phone number in public-facing files. The resume extracts in this package have it redacted.
