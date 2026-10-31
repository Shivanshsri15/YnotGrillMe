---
document_type: experience_detail
schema_version: 1
owner: Shivansh Srivastava
organization: Venwiz Technologies
feature: Workspace Insights / HawkAI
verification_status: owner_review_required
---

# Workspace Insights / HawkAI — AI-powered expediting insights

## Business problem

Executives and expeditors needed a portfolio-level view of risk across many purchase orders. Manually scanning hundreds of POs made it difficult to prioritize delays and understand root causes.

## Described architecture

The supplied resume describes a permission-aware analytics pipeline using TypeScript, NestJS, MongoDB, AWS S3, Google ADK, and LLM APIs.

The workflow combined two types of processing:

1. **Deterministic signal extraction:** business signals were derived from MongoDB data.
2. **LLM synthesis:** expediting bundles materialized in S3 were passed through a supervisor plus specialized/deep-analysis agents to synthesize insights.

The resulting user-facing concepts were ranked **Priority Alerts** and **Root Cause Insights**.

## Why combine deterministic logic and LLMs?

Deterministic logic is better suited to repeatable calculations, explicit thresholds, and business rules. LLMs can help synthesize context and explain possible causes across a bundle of information, but their output can vary and should not replace authoritative business calculations.

The hybrid design therefore uses deterministic signals as structured inputs and LLM synthesis for analysis and prioritization.

## Permission awareness

The resume explicitly describes the pipeline as permission-aware. The exact enforcement points and authorization mechanism are not fully specified in the available material. Do not claim a particular token-propagation or row-level authorization implementation without confirmation.

For a public explanation, state that the feature was designed to respect user permissions; provide implementation-level details only after confirming the actual code path.

## Output and limitations

- Output concepts: Priority Alerts and Root Cause Insights.
- The feature supports decision-making; it should not be described as guaranteeing that every risk is detected or every root cause is correct.
- Do not invent precision/recall, latency, time-saved, or adoption metrics.
- Do not disclose confidential customer data, internal prompts, private operational details, or real PO information.

## Interview-ready explanation

“The problem was that teams had to inspect many purchase orders manually to understand portfolio risk. I worked on Workspace Insights/HawkAI, which combined deterministic signals extracted from MongoDB with LLM-based synthesis over expediting bundles materialized in S3. A supervisor and specialized analysis agents helped produce ranked alerts and root-cause insights. The important design choice was to keep business signals deterministic while using the model for synthesis, and to make the workflow permission-aware.”

## Details requiring owner confirmation

- Exact Google ADK agent graph and tool boundaries.
- Which fields were included in expediting bundles.
- Exact access-control enforcement and audit behavior.
- Human review/feedback flow, if any.
- Production status and scope of each insight type.

---

## Expanded source context from the owner-provided mock-interview knowledge base

The following material preserves the relevant source section's terminology and detail. The source itself describes its content as a structured reconstruction rather than a verbatim transcript.

# 3. AI-Powered Workspace Insights and HawkAI

## 3.1 Business problem

Another major area of my work at Venwiz was an AI-powered analytics feature referred to in my professional history as Workspace Insights and the HawkAI expediting layer.

The goal was to generate useful operational insights from manufacturing and project-execution data.

Instead of relying only on users manually inspecting records, the system combined deterministic backend data processing with LLM-based analysis.

The output included Priority Alerts and Root Cause Insights.

## 3.2 Hybrid deterministic and AI architecture

The architecture combined two distinct types of processing.

**Deterministic processing** retrieved and derived structured signals from MongoDB.

**AI-based processing** synthesized and analyzed contextual information using LLMs and a multi-agent workflow.

The architecture also involved S3-materialized expediting bundles, which supplied contextual information for the analysis.

Conceptually, the flow was:

1. Retrieve relevant operational data from MongoDB.
2. Apply deterministic logic to identify structured signals.
3. Materialize or access the relevant expediting context through S3.
4. Provide the structured information and contextual material to the AI workflow.
5. Use a supervisor and specialized deep-analysis agents to synthesize insights.
6. Produce outputs such as priority alerts and root-cause analysis.

The implementation involved TypeScript, NestJS, MongoDB, AWS S3, Google ADK, and LLM APIs.

## 3.3 Why combine deterministic logic with LLMs?

A purely deterministic system can apply explicit rules consistently, but it may struggle to synthesize complex contextual information or explain possible relationships between multiple signals.

A purely LLM-driven system can generate flexible interpretations, but its outputs may be inconsistent or insufficiently grounded in authoritative business data.

The hybrid approach divides responsibilities:

- Deterministic logic establishes structured signals from operational records.
- Context retrieval supplies relevant information.
- The AI workflow analyzes and synthesizes the available evidence.
- The final output communicates operationally useful insights.

The key trade-off is between flexibility and predictability.

The deterministic layer helps preserve control over data selection and structured calculations. The AI layer contributes interpretation and synthesis.

This does not eliminate hallucinations or guarantee that every generated root cause is correct. It does provide a clearer separation between facts extracted by application logic and conclusions generated by a model.

## 3.4 Multi-agent orchestration

The AI workflow used a supervisor and specialized deep-analysis agents.

The supervisor provided an orchestration layer, while specialized agents handled deeper analysis.

This architecture separates orchestration from individual analysis tasks. It can make a workflow easier to extend when different forms of analysis are needed.

However, multi-agent designs introduce their own costs:

- Additional LLM calls.
- Greater latency.
- More complex orchestration.
- More opportunities for inconsistent intermediate outputs.
- Increased difficulty tracing the source of an incorrect conclusion.

For a production system, the complexity of a multi-agent workflow should be justified by a meaningful improvement in output quality or task coverage.

The available notes establish that I worked with this supervisor/deep-analysis structure. They do not establish that every agent was independently evaluated against a specific benchmark or that a particular accuracy guarantee was achieved in production.

## 3.5 Permission-aware AI analytics

An important characteristic of the feature was that the AI analytics workflow was permission-aware.

This matters because the underlying platform contained company and user access boundaries. An AI feature should not expose records simply because a model can retrieve or summarize them.

The permission boundary must be enforced in the application architecture, particularly when retrieving data and constructing the context passed to the model.

The general principle is that access control belongs to the trusted application layer. A prompt asking the model to ignore unauthorized information is not a substitute for preventing that information from entering the model's context.

This experience connected AI engineering with backend authorization and data security rather than treating AI as a standalone chatbot integration.

## 3.6 Engineering lessons

The project reinforced several useful architectural principles:

- Keep authoritative business-data extraction separate from language-model interpretation.
- Retrieve relevant context instead of expecting a model to infer missing operational information.
- Treat permission enforcement as a backend responsibility.
- Track the source of generated insights where possible.
- Evaluate the additional latency and cost introduced by multi-agent orchestration.
- Avoid presenting a model-generated explanation as a verified business fact without appropriate validation.

My experience here is best described as practical implementation of AI-powered product features, RAG-related patterns, and multi-agent workflows—not as a claim that I have mastered every aspect of AI engineering.

---
