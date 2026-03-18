import { useQuery } from '@tanstack/react-query'
import type { NcpdpRejectCode } from '@/lib/supabase/types'

export function useRejectCodeLookup(query: string) {
  return useQuery<NcpdpRejectCode[]>({
    queryKey: ['reject-codes', query],
    queryFn: async () => {
      const res = await fetch(`/api/rejections/lookup?q=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
    enabled: query.length > 0,
  })
}

export function useAllRejectCodes() {
  return useQuery<NcpdpRejectCode[]>({
    queryKey: ['reject-codes-all'],
    queryFn: async () => {
      const res = await fetch('/api/rejections/lookup?q=')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })
}
