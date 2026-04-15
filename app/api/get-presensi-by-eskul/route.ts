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

    const { data: presensi, error } = await supabase
      .from('presensi')
      .select('siswa_id, status')
      .eq('eskul_id', parseInt(eskul_id))

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: presensi || []
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
