---
document_type: project
schema_version: 1
owner: Shivansh Srivastava
name: AAHAAR
repository: https://github.com/Shivanshsri15/Aahaar
demo: https://aahaar-seven.vercel.app
verification_status: owner_review_required
---

# AAHAAR — surplus-food rescue and tax-benefit platform

## Summary

AAHAAR is described as a full-stack platform intended to connect surplus-food donors with NGOs and support donation tracking alongside tax-benefit calculations.

## Stack stated in supplied resume/project notes

- React, Redux, Material UI, Axios
- Node.js, Express
- MongoDB / Mongoose
- JWT and bcrypt
- AWS S3
- IPFS
- Solidity, Hardhat, Ethers, OpenZeppelin (listed in project notes)

## Features described

The supplied resume states that the platform included or supported:
- Donor onboarding using JWT/bcrypt.
- KYC document handling/verification.
- Donation lifecycle orchestration.
- NGO assignment and delivery tracking.
- A tax-computation microservice using external APIs.
- Admin telemetry dashboards.
- AWS S3 storage.

The project notes also associate the broader repository with IPFS and smart-contract tooling. The exact shipped scope of each blockchain-related component is not confirmed in the available materials; do not imply that every listed technology is used in production or fully integrated without checking the code.

## Links

- Repository: https://github.com/Shivanshsri15/Aahaar
- Demo: https://aahaar-seven.vercel.app

## Interview-ready explanation

“AAHAAR is a full-stack surplus-food rescue and tax-benefit platform. The described workflow covers donor onboarding and KYC, donation coordination with NGO assignment and delivery tracking, and a tax calculation service. The backend uses Node/Express and MongoDB, with JWT-based authentication and S3 storage.”

## Details to verify

- Which KYC steps are automated versus simulated.
- Exact external tax APIs and how their results are validated.
- Current status and availability of the demo.
- Which smart contracts are deployed and where.
- Whether IPFS/blockchain features are part of the active end-to-end user journey.

---

## Expanded source context from the owner-provided mock-interview knowledge base

The following material preserves the relevant source section's terminology and detail. The source itself describes its content as a structured reconstruction rather than a verbatim transcript.

## 11.1 AAHAAR donation and tax platform

AAHAAR is a backend-oriented platform involving donation workflows, tax calculation, NGO assignment, and delivery tracking.

The recorded technology stack includes Node.js, Express, MongoDB, JWT, and AWS S3.

The project includes KYC document verification, NGO assignment, delivery tracking, and a tax-calculation microservice.

This demonstrates experience with conventional backend concerns, including authentication, persistence, document handling, and workflow coordination.
