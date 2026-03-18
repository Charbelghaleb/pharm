import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rejectionSchema } from '@/lib/validations/rejection'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get('status')
  const code = searchParams.get('code')
  const pbm = searchParams.get('pbm')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '20')

  let query = supabase
    .from('rejections')
    .select('*, ncpdp_reject_codes(*)', { count: 'exact' })

  if (status) query = query.eq('status', status)
  if (code) query = query.eq('reject_code', code)
  if (pbm) query = query.ilike('pbm_name', `%${pbm}%`)

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, total: count, page, limit })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = rejectionSchema.safeParse(body)
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

  const { data, error } = await supabase
    .from('rejections')
    .insert({
      ...parsed.data,
      pharmacy_id: profile.pharmacy_id,
      user_id: user.id,
      rejection_timestamp: new Date().toISOString(),
      status: 'open',
    })
    .select('*, ncpdp_reject_codes(*)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
