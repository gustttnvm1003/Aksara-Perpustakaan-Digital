# Aksara — Perpustakaan Digital

Website perpustakaan digital (React + Vite) + backend API (Express + Prisma + Supabase/PostgreSQL).

## Struktur
- `src/` — frontend (login, katalog, mobile UI, riwayat email, referral)
- `server/` — API email, referral, reset password
- `.env` — konfigurasi frontend
- `server/.env` — konfigurasi backend + Supabase + SMTP + OTP

## Setup cepat

### 1. Frontend
```bash
cd aksara
cp .env.example .env
# isi VITE_API_URL=http://localhost:3000 dan kunci Supabase anon (opsional)
npm install
npm run dev
```

### 2. Backend
```bash
cd aksara/server
cp .env.example .env
# isi DATABASE_URL (Supabase), SUPABASE_*, SESSION_SECRET, JWT_SECRET, SMTP_*
npm install
npx prisma generate
npx prisma db push
npm run dev
```

API default: http://localhost:3000  
UI default: http://localhost:5173

## Env penting
Lihat `.env.example` dan `server/.env.example` (sudah digabung dengan login OTP, Supabase, SMTP, Fonnte).

## Akun demo (frontend simulasi)
| Peran | Login | Password |
|-------|--------|----------|
| Anggota | aditya@aksara.id | Aksara123 |
| Pustakawan | pustakawan@aksara.id | Aksara123 |
| Admin | admin@aksara.id | Aksara123 |
