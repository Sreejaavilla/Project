# Sentinel-AI

A fully interactive enterprise AI privacy middleware platform for secure, reversible PII redaction — enabling safe AI workflows without exposing sensitive data.

## Run & Operate

- `pnpm --filter @workspace/sentinel-ai run dev` — run the frontend (port assigned by workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, framer-motion, shadcn/ui
- PII Detection: client-side regex (piiDetector.ts)
- PDF extraction: pdfjs-dist (client-side)
- OCR: tesseract.js (client-side)
- File uploads: react-dropzone
- API: Express 5 (api-server)
- DB: PostgreSQL + Drizzle ORM (not used by Sentinel-AI frontend)

## Where things live

- `artifacts/sentinel-ai/src/` — main frontend app
- `artifacts/sentinel-ai/src/lib/piiDetector.ts` — PII detection logic (regex-based)
- `artifacts/sentinel-ai/src/lib/pdfExtractor.ts` — PDF.js text extraction
- `artifacts/sentinel-ai/src/lib/imageOcr.ts` — Tesseract.js OCR
- `artifacts/sentinel-ai/src/context/SentinelContext.tsx` — global app state
- `artifacts/sentinel-ai/src/components/` — UI panel components
- `artifacts/sentinel-ai/src/pages/SentinelApp.tsx` — main page

## Architecture decisions

- Fully client-side: all PII detection, redaction, and restoration happens in the browser — no data leaves the device (Zero Cloud Exposure)
- No backend required for core workflow; api-server exists for future enterprise features
- Placeholder mapping stored in React context state: Map<placeholder, originalValue>
- PDF.js uses CDN worker to avoid bundling the worker
- Tesseract.js handles image OCR client-side

## Product

Sentinel-AI is a "Secure Context Rehydration" platform:
1. User uploads or pastes sensitive documents
2. Client-side regex detects PII entities (names, emails, phones, financials, IDs, medical data)
3. Sensitive data replaced with typed placeholders ([PERSON_1], [EMAIL_1], etc.)
4. User copies sanitized text into any external AI
5. User pastes AI response back — Sentinel restores original values automatically
6. Full audit log of all restoration events

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- index.css: Google Font @import url() MUST be the FIRST line before @import "tailwindcss"
- All CSS custom properties start as `red` placeholders — must be replaced with proper HSL values or the UI will be red
- pdfjs-dist worker must use CDN URL: cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js
- No API hooks needed — this is a frontend-only app with no codegen

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
