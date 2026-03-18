import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's pharmacy
  const { data: profile } = await supabase
    .from('users')
    .select('pharmacy_id')
    .eq('id', user.id)
    .single()

  if (!profile?.pharmacy_id) {
    return NextResponse.json({ error: 'No pharmacy' }, { status: 400 })
  }

  const pharmacyId = profile.pharmacy_id

  // Fetch all analytics data in parallel
  const [
    totalResult,
    resolvedResult,
    rejectionsData,
    resolutionsData,
  ] = await Promise.all([
    supabase.from('rejections').select('id', { count: 'exact', head: true }).eq('pharmacy_id', pharmacyId),
    supabase.from('rejections').select('id', { count: 'exact', head: true }).eq('pharmacy_id', pharmacyId).eq('status', 'resolved'),
    supabase.from('rejections').select('reject_code, pbm_name, insurance_type, status, created_at').eq('pharmacy_id', pharmacyId),
    supabase.from('rejection_resolutions').select('revenue_recovered, time_to_resolve_minutes, outcome, action_category, created_at').eq('pharmacy_id', pharmacyId),
  ])

  const totalRejections = totalResult.count ?? 0
  const resolvedRejections = resolvedResult.count ?? 0
  const rejections = rejectionsData.data ?? []
  const resolutions = resolutionsData.data ?? []

  // Top rejection codes
  const codeCounts: Record<string, number> = {}
  rejections.forEach((r) => {
    codeCounts[r.reject_code] = (codeCounts[r.reject_code] || 0) + 1
  })
  const topCodes = Object.entries(codeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([code, count]) => ({ code, count }))

  // Rejections by PBM
  const pbmCounts: Record<string, number> = {}
  rejections.forEach((r) => {
    if (r.pbm_name) {
      pbmCounts[r.pbm_name] = (pbmCounts[r.pbm_name] || 0) + 1
    }
  })
  const byPbm = Object.entries(pbmCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }))

  // Rejections by insurance type
  const insuranceCounts: Record<string, number> = {}
  rejections.forEach((r) => {
    insuranceCounts[r.insurance_type] = (insuranceCounts[r.insurance_type] || 0) + 1
  })
  const byInsurance = Object.entries(insuranceCounts)
    .map(([type, count]) => ({ type, count }))

  // Revenue recovered
  const totalRevenue = resolutions.reduce(
    (sum, r) => sum + (Number(r.revenue_recovered) || 0), 0
  )

  // Average time to resolve
  const resolvedTimes = resolutions
    .map((r) => r.time_to_resolve_minutes)
    .filter((t): t is number => t != null && t > 0)
  const avgResolveTime = resolvedTimes.length
    ? Math.round(resolvedTimes.reduce((a, b) => a + b, 0) / resolvedTimes.length)
    : 0

  return NextResponse.json({
    totalRejections,
    resolvedRejections,
    resolutionRate: totalRejections ? Math.round((resolvedRejections / totalRejections) * 100) : 0,
    totalRevenue,
    avgResolveTime,
    topCodes,
    byPbm,
    byInsurance,
  })
}
