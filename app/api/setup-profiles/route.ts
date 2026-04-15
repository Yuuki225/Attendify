/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const usersToSetup = [
      { email: '2021001@eskul.school', role: 'siswa', nama: 'Ahmad Rizki', nis: '2021001' },
      { email: '2021002@eskul.school', role: 'siswa', nama: 'Budi Santoso', nis: '2021002' },
      { email: '2021003@eskul.school', role: 'siswa', nama: 'Citra Dewi', nis: '2021003' },
      { email: '1001@eskul.school', role: 'guru', nama: 'Ibu Siti', nis: '1001' },
      { email: '1002@eskul.school', role: 'guru', nama: 'Pak Budi', nis: '1002' },
    ]

    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 400 })
    }

    const results: any[] = []

    for (const userSetup of usersToSetup) {
      const authUser = users?.find((u) => u.email === userSetup.email)

      if (!authUser) {
        results.push({
          email: userSetup.email,
          status: 'failed',
          reason: 'User not found in Auth',
        })
        continue
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.id,
          full_name: userSetup.nama,
          nis_nip: userSetup.nis,
          role: userSetup.role,
        })

      if (profileError) {
        results.push({
          email: userSetup.email,
          status: 'failed',
          reason: profileError.message,
        })
        continue
      }

      results.push({
        email: userSetup.email,
        status: 'success',
        userId: authUser.id,
      })
    }

    return NextResponse.json({ success: true, results })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
