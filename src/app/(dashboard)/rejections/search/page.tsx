'use client'

import { useState } from 'react'
import { useSearchResolutions, useVoteResolution } from '@/lib/queries/rejections'
import { INSURANCE_TYPES, COMMON_PBMS } from '@/lib/validations/rejection'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ThumbsUp, ThumbsDown, Search } from 'lucide-react'

export default function SearchResolutionsPage() {
  const [code, setCode] = useState('')
  const [pbm, setPbm] = useState('')
  const [drug, setDrug] = useState('')
  const [insuranceType, setInsuranceType] = useState('')

  const { data: resolutions, isLoading } = useSearchResolutions({
    code: code || undefined,
    pbm: pbm || undefined,
    drug: drug || undefined,
    insurance_type: insuranceType || undefined,
  })
  const voteMutation = useVoteResolution()

  const outcomeColors: Record<string, string> = {
    claim_paid: 'bg-green-100 text-green-800',
    pa_approved: 'bg-green-100 text-green-800',
    alternative_accepted: 'bg-blue-100 text-blue-800',
    claim_denied: 'bg-red-100 text-red-800',
    pa_denied: 'bg-red-100 text-red-800',
    abandoned: 'bg-gray-100 text-gray-800',
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Search Resolutions</h1>
        <p className="text-muted-foreground">Find crowdsourced solutions from pharmacies across the network</p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Rejection Code</Label>
              <Input
                placeholder="e.g., 75"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>PBM</Label>
              <Select value={pbm} onValueChange={setPbm}>
                <SelectTrigger>
                  <SelectValue placeholder="Any PBM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any PBM</SelectItem>
                  {COMMON_PBMS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Drug Name</Label>
              <Input
                placeholder="e.g., Ozempic"
                value={drug}
                onChange={(e) => setDrug(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Insurance Type</Label>
              <Select value={insuranceType} onValueChange={setInsuranceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Any type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any type</SelectItem>
                  {INSURANCE_TYPES.map((ins) => (
                    <SelectItem key={ins.value} value={ins.value}>{ins.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading && <p className="text-muted-foreground">Searching resolutions...</p>}

      <div className="space-y-4">
        {resolutions?.map((resolution: {
          id: string
          action_taken: string
          action_category: string
          outcome: string
          reject_code: string
          pbm_name: string
          drug_name: string
          revenue_recovered: number
          time_to_resolve_minutes: number | null
          helpful_count: number
          not_helpful_count: number
          override_code_used: string | null
          notes: string | null
        }) => (
          <Card key={resolution.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex gap-2 flex-wrap">
                  {resolution.reject_code && (
                    <Badge variant="outline">Code: {resolution.reject_code}</Badge>
                  )}
                  {resolution.pbm_name && (
                    <Badge variant="secondary">{resolution.pbm_name}</Badge>
                  )}
                  {resolution.drug_name && (
                    <Badge variant="secondary">{resolution.drug_name}</Badge>
                  )}
                  <Badge className={outcomeColors[resolution.outcome] ?? 'bg-gray-100 text-gray-800'}>
                    {resolution.outcome?.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => voteMutation.mutate({ resolutionId: resolution.id, vote: 'helpful' })}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {resolution.helpful_count}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => voteMutation.mutate({ resolutionId: resolution.id, vote: 'not_helpful' })}
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    {resolution.not_helpful_count}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Action: </span>
                  <span className="text-sm">{resolution.action_taken}</span>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Category: {resolution.action_category?.replace('_', ' ')}</span>
                  {resolution.revenue_recovered > 0 && (
                    <span>Revenue: ${Number(resolution.revenue_recovered).toFixed(2)}</span>
                  )}
                  {resolution.time_to_resolve_minutes && (
                    <span>Time: {resolution.time_to_resolve_minutes} min</span>
                  )}
                </div>
                {resolution.override_code_used && (
                  <div className="text-sm">
                    <span className="font-medium text-muted-foreground">Override code: </span>
                    {resolution.override_code_used}
                  </div>
                )}
                {resolution.notes && (
                  <div className="text-sm text-muted-foreground italic">{resolution.notes}</div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {!isLoading && resolutions?.length === 0 && (code || pbm || drug) && (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No resolutions found for this combination.</p>
            <p className="text-sm text-muted-foreground mt-1">Be the first to share a resolution!</p>
          </div>
        )}

        {!code && !pbm && !drug && (
          <p className="text-muted-foreground text-center py-8">Enter search criteria to find crowdsourced resolutions</p>
        )}
      </div>
    </div>
  )
}
