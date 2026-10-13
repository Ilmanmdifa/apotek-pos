# Apotek POS

Single-store pharmacy POS: FEFO cashier, prescription-gated controlled drugs,
reports + PDF. Built with Next.js 16 (App Router + Server Actions),
Prisma + PostgreSQL, Tailwind 4, Recharts, and Stack Auth.

Evolved from a legacy CodeIgniter 3 app (`E:/Workplace/Apotek/apotek`): the data
model was fixed (expiry as real `Date`, multi-item transactions, audit log)
while keeping its signature feature — reports printable to PDF.

## Quickstart

```bash
npm install
cp .env.example .env   # fill in the 4 variables below
npx prisma migrate deploy
npx prisma db seed
npm run dev            # http://localhost:3000
```

Commands already verified in this repo: `prisma validate`,
`prisma migrate deploy`, `prisma db seed`, `tsc --noEmit`, `npm run build`.

## Environment

| Key | Value |
| --- | ----- |
| `DATABASE_URL` | PostgreSQL URL (Neon works, needs `sslmode=require`) |
| `NEXT_PUBLIC_STACK_PROJECT_ID` | From the Stack Auth dashboard |
| `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` | From the Stack Auth dashboard |
| `STACK_SECRET_SERVER_KEY` | From the Stack Auth dashboard |

## Accounts & demo

- Every app route requires a Stack Auth login. New users automatically become
  **OWNER** of their own tenant (see `lib/roles.ts`).
- No login needed: open `/demo` — a read-only showcase with sample data.
- Sample data (`prisma/seed.ts`, idempotent): 20 drugs + varied batches
  (healthy / low / near-expiry) + 20 sales from the last 14 days.

## Architecture notes

- `Sale` + `StockMovement` are the source of truth; `Product.quantity` is only
  a cache = sum of batches (`lib/stock.ts:recalcProductQty`).
- Checkout (`lib/actions/sales.ts:checkoutSale`) runs in a single
  `prisma.$transaction`: Zod validation → prescription gate → FEFO allocation
  (`lib/stock.ts:allocateFEFO`) → write Sale/Items/Movements → audit.
- Controlled drugs (`requiresPrescription`) cannot pass without prescription
  number + doctor name — in the UI and on the server
  (`lib/kasir.ts:assertPrescription`).
- No delete API for Sales/AuditLog; corrections only via reasoned returns
  that restore stock.
- Official PDFs via `pdf-lib` in `app/api/laporan/pdf/route.ts`; thermal
  receipts via print CSS (`.print-struk`) in `app/globals.css`.

## Roadmap (post-MVP)

- Pharmacist-locked compounding templates (ingredients + fee + label).
- Prescription photo/scan, multi-branch, automatic QRIS reconciliation.
