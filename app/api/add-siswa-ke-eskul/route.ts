import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { siswa_id, eskul_id } = body

    if (!siswa_id || !eskul_id) {
      return NextResponse.json({
        success: false,
        error: 'siswa_id dan eskul_id diperlukan'
      }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
      .from('eskul_siswa')
      .insert({
        siswa_id,
        eskul_id,
      })
      .select()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({
          success: true,
          message: 'Siswa sudah terdaftar di eskul ini',
          data: null,
          isAlreadyRegistered: true
        })
      }
      
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code
      }, { status: 400 })
    }
    return NextResponse.json({
      success: true,
      message: 'Siswa berhasil ditambahkan',
      data
    })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 })
  }
}
