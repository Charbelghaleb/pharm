import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolutionSchema } from '@/lib/validations/rejection'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = resolutionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // Get user's pharmacy
  const { data: profile } = await supabase
    .from('users')
    .select('pharmacy_id')
    .eq('id', user.id)
    .single()

  if (!profile?.pharmacy_id) {
    return NextResponse.json({ error: 'No pharmacy associated' }, { status: 400 })
  }

  // Create resolution
  const { data: resolution, error: resError } = await supabase
    .from('rejection_resolutions')
    .insert({
      rejection_id: id,
      pharmacy_id: profile.pharmacy_id,
      user_id: user.id,
      ...parsed.data,
      resolved_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (resError) {
    return NextResponse.json({ error: resError.message }, { status: 500 })
  }

  // Update rejection status to resolved
  await supabase
    .from('rejections')
    .update({ status: 'resolved' })
    .eq('id', id)

  return NextResponse.json(resolution, { status: 201 })
}
