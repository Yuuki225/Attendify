/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('id, full_name, nis_nip, role')
      .order('role', { ascending: true })

    const { data: siswa, error: siswaError } = await supabase
      .from('profiles')
      .select('id, full_name, nis_nip, role')
      .eq('role', 'siswa')
      .order('full_name')

    const counts = {
      total: allProfiles?.length || 0,
      siswa: siswa?.length || 0,
      guru: allProfiles?.filter((p: any) => p.role === 'guru').length || 0,
      others: allProfiles?.filter((p: any) => !p.role || (p.role !== 'siswa' && p.role !== 'guru')).length || 0,
    }

    return NextResponse.json({
      success: true,
      counts,
      allProfiles,
      siswaList: siswa,
      errors: {
        allError: allError?.message,
        siswaError: siswaError?.message,
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
