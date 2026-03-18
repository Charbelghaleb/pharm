'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { rejectionSchema, type RejectionFormData, INSURANCE_TYPES, COMMON_PBMS } from '@/lib/validations/rejection'
import { useCreateRejection } from '@/lib/queries/rejections'
import { useAllRejectCodes } from '@/lib/queries/rejection-codes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Suspense } from 'react'

function LogRejectionForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefillCode = searchParams.get('code') ?? ''

  const { data: rejectCodes } = useAllRejectCodes()
  const createRejection = useCreateRejection()

  const form = useForm<RejectionFormData>({
    resolver: zodResolver(rejectionSchema),
    defaultValues: {
      reject_code: prefillCode,
      pbm_name: '',
      pbm_bin: '',
      pbm_pcn: '',
      drug_ndc: '',
      drug_name: '',
      insurance_type: 'other',
      state: '',
    },
  })

  async function onSubmit(data: RejectionFormData) {
    try {
      const result = await createRejection.mutateAsync(data)
      router.push(`/rejections/${result.id}`)
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Log a Rejection</CardTitle>
        <CardDescription>Record a claim rejection to track and get resolution recommendations</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {createRejection.isError && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {createRejection.error.message}
            </div>
          )}

          <div className="space-y-2">
            <Label>Rejection Code</Label>
            <Select
              value={form.watch('reject_code')}
              onValueChange={(v) => form.setValue('reject_code', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select rejection code" />
              </SelectTrigger>
              <SelectContent>
                {rejectCodes?.map((code) => (
                  <SelectItem key={code.code} value={code.code}>
                    {code.code} - {code.short_description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.reject_code && (
              <p className="text-sm text-destructive">{form.formState.errors.reject_code.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pbm_name">PBM Name</Label>
            <Select
              value={form.watch('pbm_name') ?? ''}
              onValueChange={(v) => form.setValue('pbm_name', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select PBM" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_PBMS.map((pbm) => (
                  <SelectItem key={pbm} value={pbm}>{pbm}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pbm_bin">BIN</Label>
              <Input id="pbm_bin" {...form.register('pbm_bin')} placeholder="e.g., 003858" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pbm_pcn">PCN</Label>
              <Input id="pbm_pcn" {...form.register('pbm_pcn')} placeholder="e.g., ADV" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="drug_name">Drug Name</Label>
              <Input id="drug_name" {...form.register('drug_name')} placeholder="e.g., Ozempic 1mg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="drug_ndc">NDC</Label>
              <Input id="drug_ndc" {...form.register('drug_ndc')} placeholder="e.g., 00169-4132-12" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Insurance Type</Label>
            <Select
              value={form.watch('insurance_type')}
              onValueChange={(v) => form.setValue('insurance_type', v as RejectionFormData['insurance_type'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INSURANCE_TYPES.map((ins) => (
                  <SelectItem key={ins.value} value={ins.value}>{ins.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" {...form.register('state')} placeholder="e.g., NY" maxLength={2} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={createRejection.isPending}>
            {createRejection.isPending ? 'Logging...' : 'Log Rejection'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default function LogRejectionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LogRejectionForm />
    </Suspense>
  )
}
