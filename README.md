# Matching App

This repository now hosts both the Expo frontend and a new Hono-based backend. Each project lives in its own directory so that the tools and dependencies stay isolated.

## Frontend (Expo)
- Location: `./frontend`
- Install: `cd frontend && npm install`
- Develop: `npm start` (or `npm run android` / `npm run ios` / `npm run web`)

## Backend (Hono)
- Location: `./backend`
- Install: `cd backend && npm install`
- Develop: `npm run dev`
- Production build: `npm run build` then `npm start`
- Auth: Configure `EMAIL_AUTH_JWT_SECRET` to sign/verify university email OTP tokens.

## Notes
- Node modules and build artifacts are intentionally gitignored for both projects.
- If you switch dependency registries, remember to align both projects so they resolve packages consistently.
- Frontend can optionally read `EXPO_PUBLIC_API_BASE_URL` to override the API base URL.
