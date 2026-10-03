# Nexpro Fintech — Frontend

Customer, Operations, and Super Admin web app for **Nexpro Fintech**, a wallet funding platform (Credit Card / UPI / Bank Transfer → Operations review → ledger-backed wallet credit).

This is the frontend only. It talks to a FastAPI backend over `/api/v1` (see the backend repo / `Backend/` in the monorepo this was split from).

## Stack

- React 19, Vite, TypeScript
- React Router v7
- Tailwind CSS v4, shadcn/ui (Radix primitives)
- TanStack Query
- React Hook Form + Zod
- Framer Motion, Recharts

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:5173` and proxies `/api` to a backend on `http://localhost:8000` (configurable via `VITE_API_PROXY_TARGET`, see `vite.config.ts`).

```bash
npm run build   # type-check + production build
npm run lint    # oxlint
```

## Structure

```
src/
  app/guards/        route protection (role-based redirects)
  components/ui/      shadcn primitives
  components/shared/  composite components (WalletCard, StatusBadge, Stepper, Timeline, AuroraBackground, ...)
  features/            one folder per domain: auth, kyc, dashboard, wallet, funding,
                       transactions, services, profile, support, operations, admin
  layouts/             AppLayout (customer), OperationsLayout/AdminLayout (portal),
                       AuthLayout, FlowLayout, MarketingLayout
  lib/                 api client, routes, format helpers, query client
  types/               domain types mirroring the backend's API response shapes
```

## Roles

Three roles, each with its own route tree and layout: `CUSTOMER` (`/app/*`), `OPERATIONS` (`/operations/*`), `SUPER_ADMIN` (`/admin/*`). Route guards are a UX convenience — the backend enforces authorization on every request.
