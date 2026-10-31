---
id: story-hawkai-tradeoff
title: "Architectural trade-off: deterministic logic plus LLM synthesis"
summary: "**Situation:** Teams needed portfolio-level insight from large numbers of purchase orders."
tags: [architecture, ai]
projectIds: [workspace-insights-hawkai]
skillIds: [google-adk, mongodb]
visibility: public
---
## 3. Architectural trade-off: deterministic logic plus LLM synthesis

**Situation:** Teams needed portfolio-level insight from large numbers of purchase orders.

**Action supported by the source:** Combined deterministic MongoDB signal extraction with multi-agent LLM synthesis over S3-materialized expediting bundles; produced Priority Alerts and Root Cause Insights.

**Trade-off:** Deterministic logic gives repeatable business calculations; LLMs provide flexible synthesis but can be wrong or inconsistent.

**Safe result statement:** The feature was designed to reduce the need for manual scanning and help users prioritize risks. Do not invent a measured time saving or model accuracy.
