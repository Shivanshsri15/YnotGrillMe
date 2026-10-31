---
id: story-rich-text-security
title: Security and cross-platform consistency
summary: "**Situation:** Rich-text comments needed consistent formatting across multiple outputs, while unsafe HTML could create XSS risk."
tags: [security, xss]
projectIds: [rich-text-security]
skillIds: [security]
visibility: public
---
## 7. Security and cross-platform consistency

**Situation:** Rich-text comments needed consistent formatting across multiple outputs, while unsafe HTML could create XSS risk.

**Action supported by the source:** Built/productionized a feature that sanitized remarks to HTML and preserved formatting across UI, database, Excel, email, and AI workflows.

**Follow-ups:** sanitizer configuration, allowed tags, link handling, server-side enforcement, and output-specific encoding.
