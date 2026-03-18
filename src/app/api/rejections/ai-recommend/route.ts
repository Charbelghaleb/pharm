import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAIRecommendation } from '@/lib/ai/rejection-advisor'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { reject_code, pbm_name, drug_name, insurance_type } = await request.json()

  if (!reject_code) {
    return NextResponse.json({ error: 'reject_code is required' }, { status: 400 })
  }

  // Get code details
  const { data: codeData } = await supabase
    .from('ncpdp_reject_codes')
    .select('*')
    .eq('code', reject_code)
    .single()

  if (!codeData) {
    return NextResponse.json({ error: 'Unknown rejection code' }, { status: 404 })
  }

  // Get existing resolutions for context
  let resolutionQuery = supabase
    .from('rejection_resolutions')
    .select(`
      action_taken,
      outcome,
      resolution_votes(vote),
      rejections!inner(reject_code)
    `)
    .eq('is_shared', true)
    .eq('rejections.reject_code', reject_code)
    .limit(10)

  const { data: resolutions } = await resolutionQuery

  const existingResolutions = resolutions?.map((r) => ({
    action_taken: r.action_taken,
    outcome: r.outcome ?? 'unknown',
    helpful_count: (r.resolution_votes || []).filter(
      (v: { vote: string }) => v.vote === 'helpful'
    ).length,
  }))

  try {
    const recommendation = await getAIRecommendation({
      rejectCode: reject_code,
      rejectDescription: codeData.short_description,
      plainEnglish: codeData.plain_english,
      pbmName: pbm_name,
      drugName: drug_name,
      insuranceType: insurance_type,
      existingResolutions,
    })

    return NextResponse.json(recommendation)
  } catch (error) {
    console.error('AI recommendation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI recommendation' },
      { status: 500 }
    )
  }
}
