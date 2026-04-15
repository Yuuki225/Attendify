import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const users = [
      { nis: '2021001', password: 'password123', role: 'siswa', nama: 'Ahmad Rizki' },
      { nis: '2021002', password: 'password123', role: 'siswa', nama: 'Budi Santoso' },
      { nis: '2021003', password: 'password123', role: 'siswa', nama: 'Citra Dewi' },
      { nis: '1001', password: 'guru123', role: 'guru', nama: 'Ibu Siti' },
      { nis: '1002', password: 'guru123', role: 'guru', nama: 'Pak Budi' },
    ]

    const results: any[] = []

    for (const user of users) {
      const email = `${user.nis}@eskul.school`

      try {
        const { data: { users: authUsers }, error: listError } = await supabase.auth.admin.listUsers()
        
        let userId = authUsers?.find(u => u.email === email)?.id

        if (!userId) {
          const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email,
            password: user.password,
            email_confirm: true,
          })

          if (createError) {
            results.push({
              nis: user.nis,
              status: 'failed',
              reason: `Create auth: ${createError.message}`
            })
            continue
          }

          userId = newUser.user.id
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            full_name: user.nama,
            nis_nip: user.nis,
            role: user.role,
          }, {
            onConflict: 'id'
          })

        if (profileError) {
          results.push({
            nis: user.nis,
            status: 'failed',
            reason: `Profile: ${profileError.message}`
          })
        } else {
          results.push({
            nis: user.nis,
            email,
            userId,
            role: user.role,
            status: 'success'
          })
        }
      } catch (err: any) {
        results.push({
          nis: user.nis,
          status: 'error',
          reason: err.message
        })
      }
    }

    const { data: allSiswa } = await supabase
      .from('profiles')
      .select('id, full_name, nis_nip, role')
      .eq('role', 'siswa')

    return NextResponse.json({
      success: true,
      message: 'Setup selesai',
      totalSetup: users.length,
      siswaTeregister: allSiswa?.length || 0,
      results
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
