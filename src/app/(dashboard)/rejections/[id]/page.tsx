'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { resolutionSchema, type ResolutionFormData, ACTION_CATEGORIES, OUTCOME_OPTIONS } from '@/lib/validations/rejection'
import { useResolveRejection, useAIRecommendation } from '@/lib/queries/rejections'
import type { AIRecommendation } from '@/lib/ai/rejection-advisor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Sparkles, CheckCircle, AlertCircle, Clock } from 'lucide-react'

const statusColors: Record<string, string> = {
  open: 'bg-red-100 text-red-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  escalated: 'bg-orange-100 text-orange-800',
  abandoned: 'bg-gray-100 text-gray-800',
}

export default function RejectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(null)

  const { data: rejection, isLoading } = useQuery({
    queryKey: ['rejection-detail', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('rejections')
        .select('*, ncpdp_reject_codes(*), rejection_resolutions(*)')
        .eq('id', id)
        .single()
      return data
    },
  })

  const resolveMutation = useResolveRejection(id)
  const aiMutation = useAIRecommendation()

  const form = useForm<ResolutionFormData>({
    resolver: zodResolver(resolutionSchema),
    defaultValues: {
      action_taken: '',
      action_category: 'other',
      override_code_used: '',
      outcome: 'claim_paid',
      revenue_recovered: 0,
      time_to_resolve_minutes: undefined,
      notes: '',
      is_shared: true,
    },
  })

  async function onSubmit(data: ResolutionFormData) {
    try {
      await resolveMutation.mutateAsync(data)
      router.push('/rejections')
    } catch {
      // Error handled by mutation
    }
  }

  async function getAIHelp() {
    if (!rejection) return
    try {
      const result = await aiMutation.mutateAsync({
        reject_code: rejection.reject_code,
        pbm_name: rejection.pbm_name ?? undefined,
        drug_name: rejection.drug_name ?? undefined,
        insurance_type: rejection.insurance_type,
      })
      setAiRecommendation(result)
    } catch {
      // Error handled by mutation
    }
  }

  if (isLoading) return <div className="text-muted-foreground">Loading...</div>
  if (!rejection) return <div className="text-muted-foreground">Rejection not found</div>

  const isResolved = rejection.status === 'resolved'

  return (
    <div className="max-w-4xl space-y-6">
      {/* Rejection Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">
                Rejection #{rejection.reject_code}
                {rejection.ncpdp_reject_codes && (
                  <span className="font-normal text-base ml-2 text-muted-foreground">
                    {rejection.ncpdp_reject_codes.short_description}
                  </span>
                )}
              </CardTitle>
              <CardDescription className="mt-2">
                {rejection.ncpdp_reject_codes?.plain_english}
              </CardDescription>
            </div>
            <Badge className={statusColors[rejection.status] ?? statusColors.open}>
              {rejection.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {rejection.pbm_name && (
              <div>
                <span className="text-muted-foreground block">PBM</span>
                <span className="font-medium">{rejection.pbm_name}</span>
              </div>
            )}
            {rejection.drug_name && (
              <div>
                <span className="text-muted-foreground block">Drug</span>
                <span className="font-medium">{rejection.drug_name}</span>
              </div>
            )}
            {rejection.drug_ndc && (
              <div>
                <span className="text-muted-foreground block">NDC</span>
                <span className="font-medium">{rejection.drug_ndc}</span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground block">Insurance</span>
              <span className="font-medium">{rejection.insurance_type.replace('_', ' ')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Resolution Recommendations
            </CardTitle>
            <Button
              onClick={getAIHelp}
              disabled={aiMutation.isPending}
              variant="outline"
              size="sm"
            >
              {aiMutation.isPending ? 'Analyzing...' : 'Get AI Help'}
            </Button>
          </div>
        </CardHeader>
        {aiRecommendation && (
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Why this happened</p>
              <p className="text-sm">{aiRecommendation.explanation}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Recommended Steps
                <Badge variant="outline" className="ml-2">
                  {aiRecommendation.success_likelihood} likelihood
                </Badge>
              </p>
              <ol className="text-sm space-y-1">
                {aiRecommendation.recommended_steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="font-medium text-muted-foreground">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Alternative Actions</p>
              <ul className="text-sm space-y-1">
                {aiRecommendation.alternative_actions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-muted-foreground">&#8226;</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        )}
        {aiMutation.isError && (
          <CardContent>
            <p className="text-sm text-destructive">Failed to get AI recommendation. Make sure ANTHROPIC_API_KEY is configured.</p>
          </CardContent>
        )}
      </Card>

      {/* Existing Resolutions */}
      {rejection.rejection_resolutions?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Resolutions ({rejection.rejection_resolutions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rejection.rejection_resolutions.map((res: {
              id: string
              action_taken: string
              action_category: string
              outcome: string
              revenue_recovered: number
              time_to_resolve_minutes: number | null
            }) => (
              <div key={res.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline">{res.action_category.replace('_', ' ')}</Badge>
                  <Badge className={
                    res.outcome === 'claim_paid' || res.outcome === 'pa_approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }>
                    {res.outcome?.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm">{res.action_taken}</p>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  {res.revenue_recovered > 0 && <span>Revenue: ${Number(res.revenue_recovered).toFixed(2)}</span>}
                  {res.time_to_resolve_minutes && <span>Time: {res.time_to_resolve_minutes} min</span>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Resolution Form */}
      {!isResolved && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Log Resolution</CardTitle>
            <CardDescription>Record how this rejection was resolved</CardDescription>
          </CardHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {resolveMutation.isError && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {resolveMutation.error.message}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="action_taken">Action Taken</Label>
                <Textarea
                  id="action_taken"
                  {...form.register('action_taken')}
                  placeholder="Describe what you did to resolve this rejection..."
                  rows={3}
                />
                {form.formState.errors.action_taken && (
                  <p className="text-sm text-destructive">{form.formState.errors.action_taken.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Action Category</Label>
                  <Select
                    value={form.watch('action_category')}
                    onValueChange={(v) => form.setValue('action_category', v as ResolutionFormData['action_category'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTION_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Outcome</Label>
                  <Select
                    value={form.watch('outcome')}
                    onValueChange={(v) => form.setValue('outcome', v as ResolutionFormData['outcome'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OUTCOME_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="override_code_used">Override Code</Label>
                  <Input id="override_code_used" {...form.register('override_code_used')} placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="revenue_recovered">Revenue Recovered ($)</Label>
                  <Input id="revenue_recovered" type="number" step="0.01" {...form.register('revenue_recovered')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time_to_resolve_minutes">Time (minutes)</Label>
                  <Input id="time_to_resolve_minutes" type="number" {...form.register('time_to_resolve_minutes')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" {...form.register('notes')} placeholder="Additional notes..." rows={2} />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_shared"
                  checked={form.watch('is_shared')}
                  onCheckedChange={(checked) => form.setValue('is_shared', checked === true)}
                />
                <Label htmlFor="is_shared" className="font-normal">
                  Share this resolution with the PharmaClear network (anonymized)
                </Label>
              </div>
            </CardContent>
            <Separator />
            <div className="p-6 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={resolveMutation.isPending}>
                {resolveMutation.isPending ? 'Saving...' : 'Save Resolution'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  )
}
