# PetroBrain Web

PetroBrain Web is the public site and authenticated product interface for [PetroBrain](https://github.com/Trust-Code-System/PetroBrain), a source-citing intelligence platform for oil and gas teams.

[Open the live application](https://petro-brain-web.vercel.app)

## Product surfaces

- Public product, industry, insight, and research pages
- Authenticated workspace under `/app`
- Source-linked AI and analytical workflows
- Asset, market, climate-risk, document, and operational views
- Server-side proxying to the PetroBrain API
- Honest unavailable states when a trusted data source is not connected

PetroBrain does not invent market or operational values to fill gaps. Data-backed features either identify their source or report that data is unavailable.

## Technology

- Next.js 16, React 19, and TypeScript
- Contentlayer for structured editorial content
- Neon Auth for authentication and session management
- TanStack Query for client data workflows
- MapLibre for geospatial views
- Vitest, Playwright, and axe for automated verification

## Local development

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

On non-Windows shells, copy the environment template with `cp .env.example .env.local`.

The application defaults to a PetroBrain API at `http://localhost:8000`. Configure the Neon Auth variables and any optional data providers described in `.env.example`. Never commit real secrets.

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

The same core checks run in GitHub Actions. See [`DEPLOY.md`](DEPLOY.md) for production configuration and deployment guidance.

## Related repository

The API, ingestion, retrieval, and deterministic analytical tools live in the [PetroBrain backend repository](https://github.com/Trust-Code-System/PetroBrain).
