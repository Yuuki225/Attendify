# Scripts untuk Attendify

## add-users.js

Script untuk menambahkan user secara batch ke Supabase.

### Setup

1. Pastikan Anda sudah install dependencies:
   ```bash
   npm install
   ```

2. Tambahkan `SUPABASE_SERVICE_ROLE_KEY` ke file `.env.local`:
   - Buka [Supabase Dashboard](https://supabase.com)
   - Pilih project Anda
   - Settings → API → Project API Keys
   - Copy "Service Role Key" (yang lebih panjang)
   - Paste ke `.env.local`:
     ```
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
     ```

### Cara Penggunaan

1. Edit array `usersToAdd` di `scripts/add-users.js` dengan data user yang ingin ditambahkan:
   ```javascript
   const usersToAdd = [
     { nis: '2021001', password: 'password123', role: 'siswa', nama: 'Ahmad Rizki' },
     { nis: '1001', password: 'guru123', role: 'guru', nama: 'Ibu Siti' },
   ];
   ```

2. Jalankan script:
   ```bash
   node scripts/add-users.js
   ```

3. Tunggu sampai selesai ✅

### Format Data

- **nis**: Nomor Induk Siswa atau nomor guru (akan jadi bagian email: `{nis}@eskul.school`)
- **password**: Password untuk login
- **role**: `'siswa'` atau `'guru'`
- **nama**: Nama lengkap user

### Notes

- Email otomatis dibuat dari NIS: `{nis}@eskul.school`
- Password harus memenuhi requirement Supabase (minimal 6 karakter)
- User langsung ter-confirm (tidak perlu verifikasi email)
- Profil dibuat otomatis di tabel `profiles`
