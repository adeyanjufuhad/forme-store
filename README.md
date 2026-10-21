# FORME

A non-commercial portfolio concept by Fuhad Adeyanju: a flat, minimalist clothing and footwear storefront with Next.js, a Go HTTP API, and Neon Postgres. Pumpkin `#FE7F2D`, charcoal `#233D4D`, warm paper, bold editorial type, and the supplied campaign photograph. Nothing is sold, charged, or shipped.

## What's built

- Responsive campaign homepage, category browsing, URL-based search and sorting.
- Product pages with size selection, product/campaign views, and accessible size-note dialogs.
- Persistent shopping bag, quantity controls, and independent NGN / USD prices.
- Demo checkout with server-calculated totals, size/stock validation, and idempotent order creation. Every order is marked `demo`; submitted contact details are replaced with a fictional identity before storage.
- Neon-backed catalog and demo-order persistence, plus an explicitly enabled in-memory local preview.
- Eight fictional products with locally served Pexels photography, a three-story journal, and public image credits. See `IMAGE_SOURCES.md`.
- React Bits AnimatedContent and ScrollVelocity, headline entrances, staggered product reveals, hover motion, a pause control, and reduced-motion support.
- All three requested design skills installed under `.agents/skills`. Their guidance is applied in `DESIGN.md`.

## Run locally

Requires Node.js 22+, npm, and Go 1.25+.

```powershell
npm install
# Start both services using the existing local configuration:
powershell -ExecutionPolicy Bypass -File scripts/dev.ps1
```

Open http://127.0.0.1:3000. The launcher uses the local Neon configuration when `services/api/.env` exists; otherwise it starts the explicit in-memory demo mode. Credentials and local `.env` files are ignored by Git. API and frontend bind to loopback during local development.

Alternatively, run each service in its own terminal:

```powershell
# API, without a database:
cd services/api
$env:DEMO_MODE='true'
go run ./cmd/server
```

```powershell
# Storefront, from the project root:
npm run dev
```

The frontend's `API_INTERNAL_URL` defaults to `http://127.0.0.1:8080`. An existing `apps/web/.env.local` can override it. `scripts/dev.ps1` aligns the two ports for you.

## Neon configuration

A dedicated Neon project named `forme-store` is connected locally. Its initial branch is `development`, with database `forme`. To configure another environment, copy `services/api/.env.example` to `.env` and set `DATABASE_URL` to a Neon connection string. Use `sslmode=verify-full` when possible. The application rejects non-TLS database connections.

Load those environment variables, then prepare the new database explicitly:

```powershell
cd services/api
go run ./cmd/server -migrate -seed
go run ./cmd/server
```

Migrations and seeding are separate, explicit actions. Seeding never overwrites existing products. The API uses `pgxpool` with at most five connections. Set `WEB_ORIGIN` to your storefront origin before deployment. `API_HOST` defaults to `127.0.0.1`; use `0.0.0.0` only in a container or on a configured hosting service.

## API

| Endpoint            | Behavior                                                                          |
| ------------------- | --------------------------------------------------------------------------------- |
| `GET /api/health`   | Liveness and database connectivity; reports `demo` or `database` mode             |
| `GET /api/products` | Available catalog with independently configured integer NGN/USD minor-unit prices |
| `POST /api/orders`  | Simulated order; requires JSON and an `Idempotency-Key` of 16–100 characters      |

The browser calls `/api/store/*`; Next.js forwards requests to the Go API. Database credentials never enter client bundles. Orders store an immutable snapshot of the selected fictional products and server prices. Contact details are validated for the form demonstration and replaced with a fictional identity before hashing or storage. Retrying the same checkout key and product selection returns the original order; reusing the key with a different selection returns a conflict. Demo orders do **not** reserve inventory.

## Checks

```powershell
npm run typecheck
npm run build
go -C services/api test ./...
go -C services/api vet ./...
# Optional browser regression suite (requires the running local services):
npx playwright install chromium
npm run test:e2e
```

The GitHub Actions configuration is saved in `.github/checks-template.yml`. Move it to `.github/workflows/checks.yml` after granting your GitHub connection workflow permission to enable automatic checks. Local checks run without that permission.

Go tests cover currency totals, malformed customer data, size/stock validation, tampered totals, cross-origin requests, and concurrent duplicate checkouts. The database integration test runs only when `DATABASE_URL` is set and adds a clearly marked sample order to the selected database.

## Portfolio scope

This project demonstrates design and engineering; it is intentionally not monetized. Prices and product names are fictional, there is no payment integration, and no orders are fulfilled. Currency prices are configured independently; the store never claims to use live FX. Editorial copy is original and photography is credited without implying endorsement from the photographed people or visible brands.

Deploy two projects from this repository on Vercel: `apps/web` with the Next.js preset, and `services/api` with the Other preset. The Go function in `api/index.go` reuses the same tested service as the CLI. Set the frontend's server-only `API_INTERNAL_URL` to the Go deployment URL. Set the API's `WEB_ORIGIN` to the exact frontend URL and add `DATABASE_URL` as a sensitive environment variable. The API Dockerfile also supports conventional Go hosts.

To explicitly refresh the portfolio catalog from `services/api/internal/store/catalog.json`, run `go run ./cmd/server -refresh-catalog` with the database environment loaded. This updates the eight demo products; ordinary `-seed` remains non-overwriting.

See `IMAGE_SOURCES.md`, `THIRD_PARTY_NOTICES.md`, and `licenses/react-bits.txt` for asset and component attribution.
