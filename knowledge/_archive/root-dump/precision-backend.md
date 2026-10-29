---
document_type: project
schema_version: 1
owner: Shivansh Srivastava
name: PReCision — AI-powered code review system
repository: https://github.com/Shivanshsri15/PReCision
verification_status: owner_review_required
---

# PReCision — AI-powered code review backend

## Summary

PReCision is described as a repository-aware AI code review system that analyzes GitHub pull-request changes and retrieves relevant repository context to help identify potential bugs, security issues, performance problems, and code-quality concerns.

## Stack stated in project materials

- TypeScript, Node.js, NestJS
- LangGraph
- Gemini embeddings / LLM integration
- MongoDB Atlas Vector Search
- Retrieval-augmented generation (RAG)
- GitHub OAuth and GitHub webhooks
- Docker and Render deployment

## Architecture described

- Detect or receive repository change events through GitHub integrations.
- Process changed files and index relevant repository context.
- Use AST-aware chunking to preserve code structure better than arbitrary text-only splitting.
- Use incremental indexing so changed content can be updated without rebuilding all repository context every time.
- Retrieve relevant context from MongoDB Atlas Vector Search.
- Orchestrate specialized review stages for correctness/bugs, security, performance, and quality through LangGraph.
- Verify GitHub webhook signatures using `X-Hub-Signature-256`, as stated in the project notes.
- Containerize and deploy the backend using Docker/Render.

## What RAG contributes

A pull request often needs context beyond the changed lines: function definitions, related modules, callers, or repository conventions. Retrieval can provide selected code context to the review workflow. AST-aware chunking is intended to keep code units meaningful, while incremental indexing limits unnecessary reprocessing.

## Accuracy and limitations

A supplied resume reports approximately **8.5–9/10 detection accuracy**. The evaluation method, test set, definition of a successful detection, and independent validation are not included in the available material. Do not present this as a statistically validated benchmark unless the owner supplies the evaluation details.

The tool should be described as assisting code review, not replacing human review or guaranteeing that all vulnerabilities and bugs will be found.

## Repository and companion frontend

- Backend repository: https://github.com/Shivanshsri15/PReCision
- Frontend repository: https://github.com/Shivanshsri15/PReCision-Fe
- Demo listed in resume: https://precision-fe.onrender.com

## Interview-ready explanation

“I built PReCision to review GitHub code changes with repository context rather than relying only on the diff. The backend uses NestJS and LangGraph, with Gemini embeddings and MongoDB Atlas Vector Search for retrieval. I added AST-aware chunking and incremental indexing through GitHub webhook events, then orchestrated specialized review stages for bugs, security, performance, and quality. I also handled GitHub integration and containerized deployment. Its output is a review aid, not a guarantee of complete detection.”

## Details to verify before publication

- Current repository state and whether the demo is live.
- Exact review-stage graph and output schema.
- How repository/branch namespaces are represented.
- How incremental indexing handles deletions, renames, and branch changes.
- Exact OAuth permissions and webhook validation path.
- Evaluation data behind the accuracy estimate.

---

## Expanded source context from the owner-provided mock-interview knowledge base

The following material preserves the relevant source section's terminology and detail. The source itself describes its content as a structured reconstruction rather than a verbatim transcript.

# 10. PReCision: AI-Powered Code Review System

## 10.1 Overview

PReCision is a project I developed around AI-assisted code review.

The system analyzes GitHub code changes and aims to identify issues such as bugs, security vulnerabilities, performance problems, and code-quality concerns.

The project combines a backend API, GitHub integration, retrieval-augmented generation, vector search, and an orchestrated AI review workflow.

## 10.2 Backend and integrations

The recorded technology stack includes:

- TypeScript and NestJS.
- MongoDB Atlas Vector Search.
- Gemini embeddings and LLM APIs.
- LangGraph.
- GitHub OAuth and webhooks.
- Docker and deployment through Render.

The system integrates with GitHub so that code changes can trigger or inform review workflows.

The webhook implementation includes verification using the GitHub `X-Hub-Signature-256` header.

Signature verification is important because a webhook endpoint should not blindly trust arbitrary requests that claim to originate from GitHub.

## 10.3 Retrieval-augmented generation

The project uses a RAG pipeline to retrieve repository context relevant to the code being reviewed.

The central idea is that a code-review model should not analyze a changed file in complete isolation when related definitions, functions, or surrounding repository context may affect its behavior.

A retrieval pipeline can make relevant code available to the model before it generates its review.

My recorded implementation includes AST-aware chunking and incremental indexing.

### Why AST-aware chunking?

Splitting source code solely by character count or fixed text length can break logical units such as functions or classes across chunks.

Abstract syntax tree (AST)-aware chunking aims to preserve meaningful code structures when building searchable chunks.

This can improve the quality of retrieval because a result is more likely to contain a coherent code unit.

### Why incremental indexing?

Re-indexing an entire repository for every change can waste time and computation.

Incremental indexing aims to update the searchable repository context as files change, reducing unnecessary processing.

These choices reflect the trade-off between index freshness, indexing cost, retrieval quality, and implementation complexity.

## 10.4 AI orchestration

LangGraph is used to orchestrate specialized stages of the code-review workflow.

The broader purpose is to separate review tasks into manageable stages instead of relying on a single undifferentiated model call.

However, additional stages can increase latency and token usage. Their value should be evaluated by whether they improve review quality, coverage, or traceability.

The project's recorded history describes an AI-powered review backend with multi-stage orchestration. The exact production accuracy and performance characteristics should be reported only with supporting test results.

## 10.5 Important positioning

PReCision is evidence of hands-on AI engineering experience, but it should not be presented as proof that I have mastered all of AI engineering.

A more accurate description is that I have implemented a practical RAG-based AI application involving repository ingestion, embeddings, vector search, GitHub integration, and orchestrated review stages.

---
