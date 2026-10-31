---
document_type: skills
schema_version: 1
owner: Shivansh Srivastava
verification_status: owner_review_required
---

# Skills and evidence map

This file classifies skills by the evidence present in the supplied resumes and mock-interview material. These are qualitative evidence labels, not standardized proficiency ratings.

## Production experience stated in resumes / transcript

| Skill or area | Evidence | Safe description |
|---|---|---|
| TypeScript / JavaScript | Used in MMT backend, ingestion pipelines, scheduled jobs, mobile app, and cross-platform features | Production use across backend and client-side workflows |
| Node.js / NestJS | MMT services, ingestion, status engine, Workspace Insights; PReCision backend | Backend API and workflow implementation |
| MongoDB / Mongoose | MMT data workflows and PReCision vector-search project | Application data modelling and query/workflow integration |
| REST APIs | Backend systems and client/server integration | API implementation and integration |
| Scheduled jobs / event-driven pipelines | 10+ jobs and pipelines stated in resumes | Google Sheets sync, analytics, delay detection, and alerts |
| Offline-first architecture | MMT mobile app | Local data materialization and queued synchronization for low-connectivity field use |
| React Native / Expo / TypeScript | MMT mobile app | Mobile product implementation and productionization |
| AWS S3 | Workspace Insights data bundles; AAHAAR resume claims S3 storage | Object storage integration in described workflows |
| UAC/RBAC | Core contributor to platform-wide architecture | Contribution to role- and permission-based access control; not sole ownership claim |
| Rich-text sanitization / XSS mitigation | MMT cross-platform comments | Sanitization and formatting consistency across multiple output surfaces |
| Production support / release work | Resume and transcript | Releases, on-call support, and issue remediation |
| Mentoring / code review | Two interns stated in resumes | Mentored two engineering interns |

## Applied AI / project experience

| Skill or area | Evidence | Safe description |
|---|---|---|
| RAG | PReCision | Retrieval of repository context to support AI code review |
| MongoDB Atlas Vector Search | PReCision | Vector indexing and retrieval in a project |
| LangGraph | PReCision | Orchestration of specialized review stages |
| Google ADK | Workspace Insights / HawkAI, according to resume | Multi-agent synthesis in an enterprise analytics workflow |
| CrewAI | Stock Picker Agent | Multi-agent financial research workflow |
| LLM APIs (Gemini, OpenAI, Anthropic) | Resumes list these; projects use specific providers | API integration exposure; do not imply equal depth across providers |
| AST-aware chunking | PReCision | Code-aware chunking described in project material |
| GitHub webhooks and signature verification | PReCision transcript/resume context | Incremental indexing and webhook verification (`X-Hub-Signature-256` is described in project notes) |

## Frontend and mobile

- React.js / React 19 (project-specific)
- Redux Toolkit
- React Native
- Expo / Expo EAS
- TypeScript and JavaScript (ES6+)
- HTML5, CSS3
- Tailwind CSS v4 in PReCision frontend project notes
- React Bootstrap / Bootstrap in historical projects

## Cloud, tooling, and delivery

- AWS EC2, S3, IAM, Amplify (listed in supplied resumes; depth varies by service)
- Docker
- Render
- Expo EAS
- Git, GitHub, Bitbucket
- Postman
- MongoDB Atlas Vector Search
- Python (listed and used in AI learning/project context; do not position as the primary production language without further evidence)

## Learning / developing areas

The owner has stated that current priorities include:
1. DSA and coding problem solving.
2. AWS Solutions Architect Associate preparation.
3. System design.
4. Deeper backend engineering fundamentals.
5. Building more depth in AI engineering while retaining backend engineering as the main foundation.

These are learning priorities, not evidence of certification completion or expert-level proficiency. Do not state that an AWS certification has been earned unless the owner confirms it.

## Avoid unsupported proficiency claims

- Do not assign numerical proficiency scores without owner-defined criteria.
- Do not describe all technologies listed in a resume as advanced.
- Do not infer deep production experience from a dependency in a repository.
- Do not present microservices, distributed systems, or multi-agent architecture as uniformly expert-level specializations.
- Do not say the owner has completed the AWS Solutions Architect certification; preparation is the supported claim.


---

## Skill evidence boundaries and resume differences

The backend resume foregrounds TypeScript, Node.js/NestJS, MongoDB, data ingestion, pipelines, status consistency, UAC/RBAC, and the PReCision/AAHAAR projects. The AI resume foregrounds Google ADK, LangGraph, CrewAI, RAG, vector search, and HawkAI. The full-stack resume foregrounds React, React Native/Expo, Redux Toolkit, cross-platform features, and delivery. These are different emphases, not evidence that skill depth is identical across every category.

### Evidence labels recommended for the website

- **Production:** professional work is explicitly described in the Venwiz experience records. Use this label narrowly and at the relevant technology/workflow level.
- **Project:** a technology is tied to an independent or portfolio project such as PReCision, AAHAAR, QuirkyPost, or Stock Picker Agent.
- **Learning:** the owner has described the topic as a current or planned learning area, including AWS certification preparation and deeper system design/backend fundamentals.
- **Mentioned, depth unverified:** a tool appears in a resume or project stack but the available sources do not establish frequency, depth, or production ownership.

Do not turn a long skill list into a claim that every technology is an advanced skill. The owner explicitly described overall AI engineering knowledge as beginner-level despite practical implementation exposure.
