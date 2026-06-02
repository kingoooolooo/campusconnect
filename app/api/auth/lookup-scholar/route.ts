import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { scholar_number } = await request.json()

    if (!scholar_number || !/^\d{6}$/.test(scholar_number)) {
      return NextResponse.json({ error: 'Invalid scholar number' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('scholar_number', scholar_number)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'No account found' }, { status: 404 })
    }

    return NextResponse.json({ email: data.email })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
