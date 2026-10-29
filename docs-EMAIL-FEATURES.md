# Fitur Email, Referral & Reset Password

Frontend: Vite + React (stack existing).  
Backend baru: Express + Prisma + PostgreSQL + Nodemailer/Resend di folder `server/`.

Next.js tidak dipaksakan agar deploy Vercel frontend yang ada tetap aman. API REST di `server/`.

## Setup server
```bash
cd server
cp .env.example .env
# isi DATABASE_URL, SMTP_*, JWT_SECRET
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## Setup frontend
```bash
# root aksara
cp .env.example .env
npm install
npm run dev
```

## Endpoint
- GET /api/email-history
- GET /api/email-history/:id
- POST /api/referral/send
- POST /api/referral/verify
- POST /api/auth/forgot
- POST /api/auth/reset

## Keamanan
- Kode reset: bcrypt hash
- Log reset_password: body = [kode disembunyikan]
- Rate limit per email + IP
- crypto.randomBytes / randomInt
- Validasi Zod
