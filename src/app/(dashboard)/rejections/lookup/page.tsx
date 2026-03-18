'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRejectCodeLookup } from '@/lib/queries/rejection-codes'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

const categoryColors: Record<string, string> = {
  eligibility: 'bg-red-100 text-red-800',
  data_validation: 'bg-blue-100 text-blue-800',
  prior_auth: 'bg-purple-100 text-purple-800',
  dur_clinical: 'bg-orange-100 text-orange-800',
  refill_policy: 'bg-yellow-100 text-yellow-800',
  coverage: 'bg-pink-100 text-pink-800',
  other: 'bg-gray-100 text-gray-800',
}

export default function LookupPage() {
  const [query, setQuery] = useState('')
  const { data: codes, isLoading } = useRejectCodeLookup(query)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Rejection Code Lookup</h1>
        <p className="text-muted-foreground">Search any NCPDP rejection code for plain-English translation</p>
      </div>

      <div className="relative max-w-lg mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by code number or keyword (e.g., 75, prior auth, refill)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading && <p className="text-muted-foreground">Searching...</p>}

      <div className="space-y-4">
        {codes?.map((code) => (
          <Card key={code.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-mono font-bold">{code.code}</span>
                  <Badge className={categoryColors[code.category] ?? categoryColors.other} variant="outline">
                    {code.category.replace('_', ' ')}
                  </Badge>
                </div>
                <Link href={`/rejections/log?code=${code.code}`}>
                  <Button size="sm" variant="outline">Log this rejection</Button>
                </Link>
              </div>
              <CardTitle className="text-base mt-2">{code.short_description}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Plain English</p>
                <p className="text-sm">{code.plain_english}</p>
              </div>
              {code.common_causes.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Common Causes</p>
                  <ul className="text-sm space-y-1">
                    {code.common_causes.map((cause, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-muted-foreground">&#8226;</span>
                        {cause}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {code.general_resolution_steps.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Resolution Steps</p>
                  <ol className="text-sm space-y-1">
                    {code.general_resolution_steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-muted-foreground font-medium">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {query && codes?.length === 0 && !isLoading && (
          <p className="text-muted-foreground text-center py-8">No rejection codes found matching &ldquo;{query}&rdquo;</p>
        )}

        {!query && (
          <p className="text-muted-foreground text-center py-8">Enter a rejection code or keyword to search</p>
        )}
      </div>
    </div>
  )
}
