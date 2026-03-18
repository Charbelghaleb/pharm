import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { RejectionFormData, ResolutionFormData } from '@/lib/validations/rejection'

export function useRejections(params?: { status?: string; code?: string; pbm?: string; page?: number }) {
  return useQuery({
    queryKey: ['rejections', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (params?.status) searchParams.set('status', params.status)
      if (params?.code) searchParams.set('code', params.code)
      if (params?.pbm) searchParams.set('pbm', params.pbm)
      if (params?.page) searchParams.set('page', String(params.page))

      const res = await fetch(`/api/rejections?${searchParams}`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })
}

export function useRejection(id: string) {
  return useQuery({
    queryKey: ['rejection', id],
    queryFn: async () => {
      const res = await fetch(`/api/rejections?id=${id}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      return data.data?.[0]
    },
    enabled: !!id,
  })
}

export function useCreateRejection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: RejectionFormData) => {
      const res = await fetch('/api/rejections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rejections'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useResolveRejection(rejectionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: ResolutionFormData) => {
      const res = await fetch(`/api/rejections/${rejectionId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to resolve')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rejections'] })
      queryClient.invalidateQueries({ queryKey: ['rejection', rejectionId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useSearchResolutions(params: { code?: string; pbm?: string; drug?: string; insurance_type?: string }) {
  return useQuery({
    queryKey: ['search-resolutions', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (params.code) searchParams.set('code', params.code)
      if (params.pbm) searchParams.set('pbm', params.pbm)
      if (params.drug) searchParams.set('drug', params.drug)
      if (params.insurance_type) searchParams.set('insurance_type', params.insurance_type)

      const res = await fetch(`/api/rejections/search?${searchParams}`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
    enabled: !!(params.code || params.pbm || params.drug),
  })
}

export function useAIRecommendation() {
  return useMutation({
    mutationFn: async (data: { reject_code: string; pbm_name?: string; drug_name?: string; insurance_type?: string }) => {
      const res = await fetch('/api/rejections/ai-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to get recommendation')
      }
      return res.json()
    },
  })
}

export function useVoteResolution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ resolutionId, vote }: { resolutionId: string; vote: 'helpful' | 'not_helpful' }) => {
      const res = await fetch(`/api/rejections/${resolutionId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote }),
      })
      if (!res.ok) throw new Error('Failed to vote')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-resolutions'] })
    },
  })
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['rejection-analytics'],
    queryFn: async () => {
      const res = await fetch('/api/rejections/analytics')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })
}
