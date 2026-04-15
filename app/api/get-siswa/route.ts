import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: siswa, error } = await supabase
      .from('profiles')
      .select('id, full_name, nis_nip, role')
      .eq('role', 'siswa')
      .order('full_name')

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      count: siswa?.length || 0,
      data: siswa || []
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
