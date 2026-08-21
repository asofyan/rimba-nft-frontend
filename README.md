# Rimba NFT Store — Frontend

Frontend React (CRA) untuk marketplace NFT Rimba: login/register, dashboard saldo
wallet, gallery NFT, serta upload & mint on-chain untuk Admin.

## Halaman

| Route | Akses | Fungsi |
|---|---|---|
| `/login`, `/register` | publik | autentikasi |
| `/dashboard` | user | sapaan, saldo ETH wallet, navigasi |
| `/nfts` | user | gallery semua NFT + status mint |
| `/nfts/new` | Admin | upload aset NFT (multipart) |
| `/nfts/:id/edit` | Admin | edit nama/deskripsi/harga/atribut |

Role dibaca dari payload JWT (client-side). Route terproteksi via `PrivateRoute`;
token invalid/kedaluwarsa memicu auto-redirect ke `/login` oleh interceptor axios.

## Menjalankan (dev)

```bash
npm install
PORT=3100 npm start   # jangan pakai 3000 — bentrok dengan backend
```

Backend harus berjalan di `http://localhost:3000` (lihat README backend).
Ubah via `.env`: `REACT_APP_API_URL=http://localhost:3000`.

## Testing

```bash
CI=true npm test -- --watchAll=false
npm run build
```
