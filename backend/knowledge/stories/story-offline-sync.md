---
id: story-offline-sync
title: "Challenging problem: offline synchronization"
summary: "**Situation:** Field teams needed to work when connectivity was unreliable."
tags: [debugging, mobile, sync]
projectIds: [offline-first-mobile]
skillIds: [react-native, typescript]
visibility: public
---
## 2. Challenging technical problem: offline synchronization

**Situation:** Field teams needed to work when connectivity was unreliable.

**Task:** Build a mobile experience that could keep data available locally and synchronize writes later.

**Actions supported by the source:** Built the React Native/Expo/TypeScript app; used endpoint-addressable local storage and a queue of endpoint/payload operations; implemented sequential processing, retries, change tracking, and timestamp-based conflict handling; owned productionization and deployment.

**Trade-off:** Sequential FIFO processing simplifies ordering but can reduce throughput. Timestamp conflict resolution is pragmatic but weaker than explicit versioning in some concurrent-edit scenarios.

**Result:** The resume describes the app as supporting field operations in low-connectivity environments. No numerical reliability metric is available.

**Follow-ups to prepare:** queue persistence, retry/backoff, duplicate handling, offline coverage, conflict rules, monitoring, and recovery from permanently failing operations.
