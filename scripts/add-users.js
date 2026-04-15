/* eslint-disable @typescript-eslint/no-unused-vars */
// Script untuk menambahkan user secara manual ke Supabase
// Gunakan: node scripts/add-users.js

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: '.env.local' });

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Daftar user yang ingin ditambahkan
const usersToAdd = [
  { nis: '2021001', password: 'password123', role: 'siswa', nama: 'Ahmad Rizki' },
  { nis: '2021002', password: 'password123', role: 'siswa', nama: 'Budi Santoso' },
  { nis: '2021003', password: 'password123', role: 'siswa', nama: 'Citra Dewi' },
  { nis: '1001', password: 'guru123', role: 'guru', nama: 'Ibu Siti' },
  { nis: '1002', password: 'guru123', role: 'guru', nama: 'Pak Budi' },
];

async function addUsers() {
  console.log('🚀 Mulai menambahkan user...\n');

  for (const user of usersToAdd) {
    try {
      const email = `${user.nis}@eskul.school`;

      let userId
      const { data, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: user.password,
        email_confirm: true,
      })

      if (authError?.message?.includes('already been registered')) {
        console.log(`  ℹ️  User sudah ada, mencari ID...`)
        const { data: existingUser, error: lookupError } = await supabase.auth.admin.getUserById(
          email 
        )
      
        userId = null
      } else if (authError) {
        console.error(`  ❌ Error Auth: ${authError.message}`)
        continue
      } else {
        userId = data.user.id
        console.log(`  ✅ User Auth dibuat (ID: ${userId})`)
      }

      // 2. Buat profile di database
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: user.nama,
          nis_nip: user.nis,
          role: user.role,
        });

      if (profileError) {
        console.error(`  ❌ Error Profile: ${profileError.message}`);
        continue;
      }

      console.log(`  ✅ Profile dibuat\n`);
    } catch (err) {
      console.error(`❌ Unexpected error: ${err.message}\n`);
    }
  }

  console.log('✨ Selesai!');
  process.exit(0);
}

addUsers().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
