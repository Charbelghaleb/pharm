'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface RejectionFiltersProps {
  status: string
  code: string
  pbm: string
  onStatusChange: (value: string) => void
  onCodeChange: (value: string) => void
  onPbmChange: (value: string) => void
}

export function RejectionFilters({
  status,
  code,
  pbm,
  onStatusChange,
  onCodeChange,
  onPbmChange,
}: RejectionFiltersProps) {
  return (
    <div className="flex gap-4 flex-wrap">
      <div className="space-y-1">
        <Label className="text-xs">Status</Label>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
            <SelectItem value="abandoned">Abandoned</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Reject Code</Label>
        <Input
          placeholder="e.g., 75"
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          className="w-[120px]"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">PBM</Label>
        <Input
          placeholder="e.g., Express Scripts"
          value={pbm}
          onChange={(e) => onPbmChange(e.target.value)}
          className="w-[180px]"
        />
      </div>
    </div>
  )
}
