# Aksara — Perpustakaan Digital

Website perpustakaan digital (frontend React + Vite + Tailwind).

## Fitur
- Login (Input → Proses → Output) dengan validasi & akun demo
- Menu profil: **Edit profil** dan **Keluar dari akun**
- Statistik **Buku digital tersedia** realtime dari katalog
- Tambah buku (pustakawan/admin) — angka ikut naik
- Sesi tersimpan (refresh tidak logout); katalog & koleksi di localStorage

## Akun demo
| Peran | Login | Password |
|-------|--------|----------|
| Anggota | aditya@aksara.id | Aksara123 |
| Pustakawan | pustakawan@aksara.id | Aksara123 |
| Admin | admin@aksara.id | Aksara123 |

## Pengembangan lokal
```bash
npm install
npm run dev
```

## Build produksi (siap hosting)
```bash
npm install
npm run build
```
Hasil ada di folder `dist/`. Unggah **seluruh isi** `dist/` ke hosting statis.

### Opsi hosting
- **Netlify / Cloudflare Pages**: drag folder `dist`, atau hubungkan repo. File `public/_redirects` ikut ter-copy.
- **Vercel**: `vercel.json` sudah disiapkan.
- **GitHub Pages / hosting biasa**: `base: './'` di Vite agar path aset relatif aman.
- Pratinjau lokal hasil build: `npm run preview`

## Catatan
Prototipe frontend (autentikasi & data di browser). Siap dilanjutkan ke API backend.
