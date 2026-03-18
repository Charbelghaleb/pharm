'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { RejectionWithCode } from '@/lib/supabase/types'

const statusColors: Record<string, string> = {
  open: 'bg-red-100 text-red-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  escalated: 'bg-orange-100 text-orange-800',
  abandoned: 'bg-gray-100 text-gray-800',
}

export function RejectionTable({ rejections }: { rejections: RejectionWithCode[] }) {
  if (!rejections?.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No rejections found</p>
        <p className="text-sm mt-1">
          <Link href="/rejections/log" className="text-primary underline">Log your first rejection</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left px-4 py-3 font-medium">Date</th>
            <th className="text-left px-4 py-3 font-medium">Code</th>
            <th className="text-left px-4 py-3 font-medium">Drug</th>
            <th className="text-left px-4 py-3 font-medium">PBM</th>
            <th className="text-left px-4 py-3 font-medium">Insurance</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rejections.map((rejection) => (
            <tr key={rejection.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3">
                <Link href={`/rejections/${rejection.id}`} className="text-primary hover:underline">
                  {new Date(rejection.created_at).toLocaleDateString()}
                </Link>
              </td>
              <td className="px-4 py-3">
                <span className="font-mono font-medium">{rejection.reject_code}</span>
                {rejection.ncpdp_reject_codes && (
                  <span className="text-muted-foreground ml-1 text-xs">
                    {rejection.ncpdp_reject_codes.short_description}
                  </span>
                )}
              </td>
              <td className="px-4 py-3">{rejection.drug_name ?? '-'}</td>
              <td className="px-4 py-3">{rejection.pbm_name ?? '-'}</td>
              <td className="px-4 py-3 text-xs">{rejection.insurance_type.replace('_', ' ')}</td>
              <td className="px-4 py-3">
                <Badge className={statusColors[rejection.status] ?? statusColors.open} variant="outline">
                  {rejection.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
