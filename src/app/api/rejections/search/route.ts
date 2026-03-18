import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const pbm = searchParams.get('pbm')
  const drug = searchParams.get('drug')
  const insuranceType = searchParams.get('insurance_type')

  // Search shared resolutions across the network
  let query = supabase
    .from('rejection_resolutions')
    .select(`
      *,
      rejections!inner(reject_code, pbm_name, drug_name, insurance_type),
      resolution_votes(vote)
    `)
    .eq('is_shared', true)

  if (code) {
    query = query.eq('rejections.reject_code', code)
  }
  if (pbm) {
    query = query.ilike('rejections.pbm_name', `%${pbm}%`)
  }
  if (drug) {
    query = query.ilike('rejections.drug_name', `%${drug}%`)
  }
  if (insuranceType) {
    query = query.eq('rejections.insurance_type', insuranceType)
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Calculate vote counts and anonymize pharmacy info
  const results = data?.map((resolution) => {
    const votes = resolution.resolution_votes || []
    return {
      id: resolution.id,
      action_taken: resolution.action_taken,
      action_category: resolution.action_category,
      override_code_used: resolution.override_code_used,
      outcome: resolution.outcome,
      revenue_recovered: resolution.revenue_recovered,
      time_to_resolve_minutes: resolution.time_to_resolve_minutes,
      notes: resolution.notes,
      created_at: resolution.created_at,
      reject_code: resolution.rejections?.reject_code,
      pbm_name: resolution.rejections?.pbm_name,
      drug_name: resolution.rejections?.drug_name,
      insurance_type: resolution.rejections?.insurance_type,
      helpful_count: votes.filter((v: { vote: string }) => v.vote === 'helpful').length,
      not_helpful_count: votes.filter((v: { vote: string }) => v.vote === 'not_helpful').length,
    }
  })

  return NextResponse.json(results)
}
