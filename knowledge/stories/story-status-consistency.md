---
id: story-status-consistency
title: "Data consistency: statusData v2"
summary: "**Situation:** Duplicated status logic and divergent status vocabularies led to conflicting PO status/risk values across services."
tags: [architecture, consistency]
projectIds: [status-engine]
skillIds: [nestjs, mongodb]
visibility: public
---
## 4. Data consistency: statusData v2

**Situation:** Duplicated status logic and divergent status vocabularies led to conflicting PO status/risk values across services.

**Action supported by the source:** Centralized computation in a deterministic, IST-pinned engine and unified the `statusData` contract across five servers.

**Result stated in source:** Status drift was eliminated.

**Follow-ups:** timezone boundary tests, contract rollout, compatibility, status definitions, and how consumers adopted the shared engine.
