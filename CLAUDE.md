# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Monorepo for a university student matching app with React Native (Expo) frontend and Hono backend. The backend provides a type-safe REST API, and the frontend consumes it with full TypeScript type safety via OpenAPI-generated schemas.

## Development Commands

### Frontend (Expo)
```bash
cd frontend
npm install
npm start           # Start Expo dev server
npm run android     # Run on Android
npm run ios         # Run on iOS
npm run web         # Run in browser
npm run lint        # ESLint
npm run format      # Prettier formatting
```

### Backend (Hono)
```bash
cd backend
npm install
npm run dev                  # Start dev server with watch mode
npm run build                # Build TypeScript
npm start                    # Run production build
npm run generate:openapi     # Generate OpenAPI spec
npm run format               # Prettier formatting
```

### Type Safety Workflow
When making backend API changes:
1. Modify Zod schemas in `backend/src/routes/*.ts`
2. Run `cd backend && npm run generate:openapi` to update `backend/openapi/openapi.json`
3. Frontend types auto-regenerate on next build via `openapi-typescript`

## Architecture

### Frontend Structure (`./frontend`)

**Routing**: File-based routing with expo-router v6
- `/frontend/app/_layout.tsx` - Root layout with nested providers (Auth → API → Theme)
- `/frontend/app/(tabs)/_layout.tsx` - Bottom tab navigation (Home, Explore, Account)
- Routes organized in `app/` directory following expo-router conventions

**API Integration Pattern**:
- OpenAPI-based type safety via `openapi-fetch` + `openapi-react-query`
- Auto-generated types from backend OpenAPI spec in `frontend/openapi/api-schema.ts`
- API client initialized in `frontend/providers/ApiProvider.tsx:30-54` with auth middleware
- All requests automatically include Auth0/Email OTP token via middleware (lines 36-50)
- Example usage: `const { openapi } = useApiClient(); openapi.useQuery("get", "/catalog/universities", {})`

**Authentication**:
- Dual auth system: Auth0 (via `react-native-auth0`) + Email OTP (university email verification)
- Auth0 provider setup: `frontend/providers/AuthProvider.tsx:10-29`
- Email OTP flow: `frontend/app/verify/email-otp.tsx` with service at `frontend/services/universityEmailOtp.ts:29-57`
- Auth middleware automatically injects tokens and handles 401 refreshes (ApiProvider.tsx:36-50)

**State Management**:
- React Context for auth and API client
- React Query for server state caching
- No Redux/MobX - lightweight API-driven approach

**Key Directories**:
```
frontend/
├── app/              # File-based routes (expo-router)
├── providers/        # React Context providers (Auth, API, Theme)
├── services/         # API service functions
├── openapi/          # Auto-generated OpenAPI types
├── components/       # Reusable UI components
├── hooks/            # Custom hooks
└── constants/        # Theme, colors
```

### Backend Structure (`./backend`)

**Framework**: Hono v4.6.12 with `@hono/zod-openapi` for type-safe OpenAPI endpoints

**Layered Architecture**:
1. **Routes** (`src/routes/*.ts`) - HTTP handlers with Zod validation
2. **Use Cases** (`src/use-cases/`) - Business logic orchestration
3. **Domain Services** (`src/domain/services/`) - Core algorithms (e.g., MatchService)
4. **Repositories** (`src/infrastructure/repositories/`) - Data access (Drizzle ORM)
5. **Entities** (`src/domain/entities/`) - Domain models

**Database**:
- SQLite + Drizzle ORM
- Schema: `src/infrastructure/db/schema.ts:1-50` (universities, profiles, intentOptions, weightPresets, verificationFlags)
- Database client: `src/infrastructure/db/client.ts:17-26`
- Bootstrap/seeding: `src/infrastructure/db/bootstrap.ts` (runs on startup)
- No migration system - seeds on container creation

**Dependency Injection**:
- Manual container pattern in `src/container.ts:12-42`
- Creates repositories, use cases, and services
- Injected into routes via `c.get('deps')`

**Authentication**:
- Email OTP middleware: `src/middleware/email-otp.ts:24-49` (JWT verification)
- Protects `/matches/*` and `/profile/*` routes (app.ts:57-58)
- JWT config: 2-hour expiry, HS256, secret from `EMAIL_AUTH_JWT_SECRET` env var
- OTP flow: 10-minute expiry, 5 max attempts, domain allowlist enforced (auth.ts:110)

**API Routes**:
- `/auth/email/request` - Request OTP (auth.ts:61-160)
- `/auth/email/verify` - Verify OTP, get JWT (auth.ts:161-234)
- `/catalog/universities` - List universities with filters (catalog.ts:93-138)
- `/catalog/configuration` - Get intents, weight presets (catalog.ts:39-92)
- `/matches/recommended` - Get match candidates (protected)
- `/profile` - Update profile (protected)

**OpenAPI Generation**:
- Run `npm run generate:openapi` to create `backend/openapi/openapi.json`
- Script: `src/scripts/generate-openapi.ts:1-18`
- Config: `src/app.ts:12-41` defines API metadata and security schemes

**Key Directories**:
```
backend/
├── src/
│   ├── routes/              # API route definitions
│   ├── middleware/          # Auth, error handling
│   ├── domain/
│   │   ├── entities/        # Domain models
│   │   ├── repositories/    # Repository interfaces
│   │   └── services/        # Domain services (MatchService)
│   ├── use-cases/           # Business logic
│   ├── infrastructure/
│   │   ├── db/              # Database schema, client, bootstrap
│   │   └── repositories/    # Drizzle implementations
│   ├── scripts/             # OpenAPI generation
│   ├── container.ts         # DI container
│   └── server.ts            # Entry point
└── openapi/                 # Generated OpenAPI spec
```

### Frontend-Backend Integration

**Type Safety Pipeline**:
```
Backend Zod Schemas (@hono/zod-openapi)
  ↓
OpenAPI JSON (backend/openapi/openapi.json)
  ↓
Frontend Types (openapi-typescript)
  ↓
Type-safe Fetch Client (openapi-fetch + openapi-react-query)
```

**Environment Variables**:
- Backend: `EMAIL_AUTH_JWT_SECRET`, `DATABASE_PATH`, `PORT`, `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`
- Frontend: `EXPO_PUBLIC_API_BASE_URL` or `app.json` extra.apiBaseUrl, auth0Domain, auth0ClientId

**API Base URL**:
- Frontend reads from: `Constants.expoConfig?.extra?.apiBaseUrl` or `process.env.EXPO_PUBLIC_API_BASE_URL`
- Default: `http://localhost:3001`
- Set in `frontend/openapi/api-client.ts:7-11`

## Important Patterns

### Making API Changes
1. Update Zod schema in backend route file
2. Regenerate OpenAPI: `cd backend && npm run generate:openapi`
3. Frontend types update automatically on next build
4. Use type-safe client: `openapi.useQuery("get", "/your/endpoint", { params })`

### Adding Protected Routes
1. Apply `emailOtpMiddleware` in backend (see app.ts:57-58)
2. Frontend auth middleware auto-injects token (ApiProvider.tsx:36-50)
3. Handle 401 by re-authorizing via Auth0

### Database Changes
1. Modify schema in `backend/src/infrastructure/db/schema.ts`
2. Update repository interfaces in `backend/src/domain/repositories/`
3. Update Drizzle implementations in `backend/src/infrastructure/repositories/`
4. Update bootstrap seeding if needed

### Auth Flow
**Email OTP**:
- Request: POST `/auth/email/request` with university email (must match allowlist)
- Verify: POST `/auth/email/verify` with 6-digit code
- Receive: JWT token valid for 2 hours
- Use: Automatically injected in Authorization header via ApiProvider middleware

**Auth0** (legacy/alternative):
- Configured in `frontend/providers/AuthProvider.tsx`
- Credentials in `app.json` extra or environment variables

## Testing Endpoints
Use curl or tools like Postman:
```bash
# Request OTP
curl -X POST http://localhost:3001/auth/email/request \
  -H "Content-Type: application/json" \
  -d '{"email":"student@u-tokyo.ac.jp"}'

# Verify OTP
curl -X POST http://localhost:3001/auth/email/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"student@u-tokyo.ac.jp","code":"123456"}'

# Get universities
curl http://localhost:3001/catalog/universities?search=tokyo&limit=10

# Protected endpoint (requires token)
curl http://localhost:3001/matches/recommended \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Code References

Authentication:
- Backend auth routes: `/backend/src/routes/auth.ts:1-234`
- Email OTP middleware: `/backend/src/middleware/email-otp.ts:24-49`
- Frontend Auth0 setup: `/frontend/providers/AuthProvider.tsx:10-29`
- API auth middleware: `/frontend/providers/ApiProvider.tsx:36-50`

API Integration:
- API provider: `/frontend/providers/ApiProvider.tsx:30-54`
- OpenAPI generation: `/backend/src/scripts/generate-openapi.ts:1-18`
- Type-safe client init: `/frontend/openapi/api-client.ts:1-14`

Database:
- Schema: `/backend/src/infrastructure/db/schema.ts:1-50`
- Client: `/backend/src/infrastructure/db/client.ts:17-26`
- DI Container: `/backend/src/container.ts:12-42`

Routing:
- Root layout: `/frontend/app/_layout.tsx:1-51`
- Tab navigation: `/frontend/app/(tabs)/_layout.tsx:1-49`
- Home screen API usage: `/frontend/app/(tabs)/index.tsx:40-53`
