import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const { noteId } = await params
    const supabase = await createClient()

    const { data: note, error } = await supabase
      .from('notes')
      .select('file_url, title, file_type')
      .eq('id', noteId)
      .single()

    if (error || !note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    const extension = note.file_type || 'pdf'
    const safeFilename = `${note.title.replace(/[^a-zA-Z0-9_ -]/g, '_')}.${extension}`

    // Fetch the file from Cloudinary and stream it
    const response = await fetch(note.file_url)

    if (!response.ok) {
      return NextResponse.redirect(note.file_url)
    }

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
      },
    })
  } catch (err) {
    console.error('[Download] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
