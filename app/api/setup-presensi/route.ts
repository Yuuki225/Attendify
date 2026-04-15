import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE presensi
        ADD COLUMN IF NOT EXISTS keterangan TEXT;
      `
    })

    if (error && error.message?.includes('exec_sql')) {
      const { data: columns } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'presensi')
        .eq('table_schema', 'public')

      console.log('Columns in presensi:', columns)
      
      return NextResponse.json({
        success: true,
        message: 'Setup SQL tidak bisa via RPC. Silakan jalankan manual query di SQL Editor Supabase.',
        query: `ALTER TABLE presensi ADD COLUMN IF NOT EXISTS keterangan TEXT;`
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Kolom keterangan berhasil ditambahkan (atau sudah ada)'
    })
  } catch (err: any) {
    console.error('Error:', err)
    return NextResponse.json({
      success: false,
      error: err.message,
      hint: 'Silakan jalankan query ini di Supabase SQL Editor: ALTER TABLE presensi ADD COLUMN IF NOT EXISTS keterangan TEXT;'
    }, { status: 500 })
  }
}
