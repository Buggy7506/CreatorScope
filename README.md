# CreatorScope Monorepo

CreatorScope is now structured as a modern Vite + React frontend with a separate backend API. This repository includes:

- `client/` — Vite + React frontend app
- `server/` — Node + Express backend API using direct PostgreSQL queries through pg

## Stack
- Frontend: Vite, React, TypeScript, Tailwind CSS
- Backend: Express, TypeScript, pg
- Database: PostgreSQL (direct SQL via pg)
- API: separated backend with `/api` endpoints

## Setup

### Frontend
```bash
cd client
npm install
npm run dev
```

### Backend
```bash
cd server
npm install
cp .env.example .env
npm run dev
```

## Project structure
- `client/` — frontend website and dashboard
  - `src/` — React code
  - `public/` — static assets and app manifest
- `server/` — backend API and database schema
  - `src/` — Express server code
  - `sql/` — SQL schema and seed files

## What’s included
- Landing page and dashboard in the frontend
- Multi-platform creator analytics mock data
- Revenue tracking, subscription plan concepts, and a starter package offering
- AI caption generator and viral content signal UI
- Agency package system placeholder support
- Express API server with health, analytics, auth, subscriptions, payments, and agency placeholder routes
- Versioned backend API under `server/src/routes/v1`
- Frontend service layer and query hooks under `client/src/services`
- 30-day free trial for new creator accounts
- SQL schema for users, connected accounts, videos, analytics, subscriptions, viral scores, heatmaps, and AI insights
- App-ready PWA metadata for the frontend

## Next steps
- Wire frontend requests to `http://localhost:5000/api/v1`
- Add OAuth and real platform integrations for TikTok, YouTube, Instagram
- Enable Stripe billing and Clerk auth
- Add agency packages, creator payout modeling, and subscription state management
- Deploy frontend to Vercel/Netlify and backend to Railway/Render
