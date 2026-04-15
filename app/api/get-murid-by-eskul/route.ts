/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const eskul_id = searchParams.get('eskul_id')

    if (!eskul_id) {
      return NextResponse.json({
        success: false,
        error: 'eskul_id diperlukan'
      }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: registeredMurid } = await supabase
      .from('eskul_siswa')
      .select('siswa_id')
      .eq('eskul_id', parseInt(eskul_id))

    const { data: presensiMurid, error: presError } = await supabase
      .from('presensi')
      .select('siswa_id, status, keterangan, tanggal, eskul_id')
      .eq('eskul_id', parseInt(eskul_id))

    let finalPresensiMurid = presensiMurid
    if ((!presensiMurid || presensiMurid.length === 0) && presError?.code !== 'PGRST116') {
      const { data: presensiStr } = await supabase
        .from('presensi')
        .select('siswa_id, status, keterangan, tanggal, eskul_id')
        .eq('eskul_id', eskul_id)
      finalPresensiMurid = presensiStr
    }

    const allSiswaIds = new Set<string>()
    if (registeredMurid) {
      registeredMurid.forEach(m => allSiswaIds.add(m.siswa_id))
    }
    if (finalPresensiMurid) {
      finalPresensiMurid.forEach(m => allSiswaIds.add(m.siswa_id))
    }

    if (allSiswaIds.size === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        presensiData: []
      })
    }

    const siswaIds = Array.from(allSiswaIds)
    const { data: profilesData, error: profError } = await supabase
      .from('profiles')
      .select('id, nis_nip, full_name')
      .in('id', siswaIds)

    if (profError) {
    }

    return NextResponse.json({
      success: true,
      data: profilesData || [],
      presensiData: finalPresensiMurid || []
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
