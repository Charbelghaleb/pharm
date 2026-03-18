import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: resolutionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { vote } = await request.json()
  if (!vote || !['helpful', 'not_helpful'].includes(vote)) {
    return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 })
  }

  // Upsert vote (one vote per user per resolution)
  const { data, error } = await supabase
    .from('resolution_votes')
    .upsert(
      {
        resolution_id: resolutionId,
        user_id: user.id,
        vote,
      },
      { onConflict: 'resolution_id,user_id' }
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
