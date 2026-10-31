# Why Not Grill Me?

Interactive AI-powered engineering portfolio — grill-themed, graph-navigated.

```text
YnotGrillMe/
  backend/    NestJS API + Markdown knowledge
  frontend/   Vite + React (butcher-paper × data-structures UI)
```

## Frontend

**Agentic grill chat** (Vite + React) — not a marketing portfolio site.

- Full-app chat shell with SSE to `POST /agent/chat`  
- Heat controls (warm-up / medium rare / well done) + audience  
- Streaming tokens, highlight chips, rabbit-hole suggestions, receipts  
- Charcoal / ember chrome · Unbounded + Outfit + IBM Plex Mono  


## Quick start

### Backend

```bash
cd backend
cp .env.example .env   # if needed
npm install
npm run start:dev
```

API: http://localhost:3000/api/v1/health  

Docs: [backend/README.md](backend/README.md)

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App: http://localhost:5173  

## Status

Backend phases 0–3 shipped. Frontend scaffold + theme tokens in place; product surfaces (chat, grill, graph explorer) next.
