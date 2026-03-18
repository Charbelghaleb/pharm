import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q') ?? ''

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let dbQuery = supabase.from('ncpdp_reject_codes').select('*')

  if (query) {
    // Search by code number or description text
    dbQuery = dbQuery.or(`code.ilike.%${query}%,short_description.ilike.%${query}%,plain_english.ilike.%${query}%`)
  }

  const { data, error } = await dbQuery.order('code').limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
