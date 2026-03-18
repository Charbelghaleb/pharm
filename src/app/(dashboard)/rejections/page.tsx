'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRejections } from '@/lib/queries/rejections'
import { RejectionTable } from '@/components/rejections/rejection-table'
import { RejectionFilters } from '@/components/rejections/rejection-filters'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'

export default function RejectionsPage() {
  const [status, setStatus] = useState('')
  const [code, setCode] = useState('')
  const [pbm, setPbm] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useRejections({
    status: status && status !== 'all' ? status : undefined,
    code: code || undefined,
    pbm: pbm || undefined,
    page,
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rejections</h1>
          <p className="text-muted-foreground">
            {data?.total ?? 0} total rejections
          </p>
        </div>
        <Link href="/rejections/log">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Log Rejection
          </Button>
        </Link>
      </div>

      <div className="mb-4">
        <RejectionFilters
          status={status}
          code={code}
          pbm={pbm}
          onStatusChange={setStatus}
          onCodeChange={setCode}
          onPbmChange={setPbm}
        />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading rejections...</p>
      ) : (
        <>
          <RejectionTable rejections={data?.data ?? []} />

          {data?.total > 20 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground self-center">
                Page {page} of {Math.ceil(data.total / 20)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page * 20 >= data.total}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
