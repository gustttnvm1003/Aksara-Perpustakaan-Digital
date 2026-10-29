# Aksara Server — Email History, Referral, Reset Password

Backend Express + Prisma + PostgreSQL untuk fitur email.

## Fitur
- `email_logs` permanen (riwayat email)
- `sendEmail()` terpusat (pending → sent/failed)
- Kode referral via email + verifikasi
- Reset password via kode 6 digit (hash bcrypt)
- Rate limiting & validasi Zod

## Setup

```bash
cd server
cp .env.example .env
# edit DATABASE_URL, SMTP_*, JWT_SECRET

npm install
npx prisma generate
npx prisma db push
# atau: npm run db:migrate

npm run dev
```

API default: `http://localhost:4000`

## Endpoint

| Method | Path | Auth | Keterangan |
|--------|------|------|------------|
| GET | `/api/health` | - | Health check |
| GET | `/api/email-history` | Bearer | List + filter + pagination |
| GET | `/api/email-history/:id` | Bearer | Detail body email |
| POST | `/api/referral/send` | Bearer | Kirim kode referral |
| POST | `/api/referral/verify` | Bearer | Verifikasi kode |
| POST | `/api/auth/forgot` | - | Minta kode reset (pesan generik) |
| POST | `/api/auth/reset` | - | Reset password dengan kode |

## Uji cepat

```bash
# Health
curl http://localhost:4000/api/health

# Forgot (selalu pesan generik)
curl -X POST http://localhost:4000/api/auth/forgot \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

Tanpa SMTP di development, email disimulasikan di console tetapi **tetap tercatat** di `email_logs`.

## Keamanan
- Kode reset disimpan sebagai **bcrypt hash**
- Body log tipe `reset_password` berisi `[kode disembunyikan]`
- Rate limit per email + IP untuk forgot
- Generator kode: `crypto.randomBytes` / `randomInt`
