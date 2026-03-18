'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { pharmacyOnboardingSchema, type PharmacyOnboardingData, PHARMACY_TYPES, PMS_SYSTEMS } from '@/lib/validations/pharmacy'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const STEPS = [
  { title: 'Pharmacy Details', description: 'Basic information about your pharmacy' },
  { title: 'Location', description: 'Your pharmacy address' },
  { title: 'Configuration', description: 'Pharmacy type and PMS system' },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<PharmacyOnboardingData>({
    resolver: zodResolver(pharmacyOnboardingSchema),
    defaultValues: {
      name: '',
      npi: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      pharmacy_type: 'retail',
      pms_system: 'other',
    },
  })

  async function onSubmit(data: PharmacyOnboardingData) {
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    // Create pharmacy
    const { data: pharmacy, error: pharmacyError } = await supabase
      .from('pharmacies')
      .insert({
        name: data.name,
        npi: data.npi,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        pharmacy_type: data.pharmacy_type,
        pms_system: data.pms_system,
        onboarded_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (pharmacyError) {
      setError(pharmacyError.message)
      setLoading(false)
      return
    }

    // Link user to pharmacy
    const { error: userError } = await supabase
      .from('users')
      .update({ pharmacy_id: pharmacy.id })
      .eq('id', user.id)

    if (userError) {
      setError(userError.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  function nextStep() {
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 0))
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <div className="flex gap-2 mb-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${
                i <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <CardTitle>{STEPS[step].title}</CardTitle>
        <CardDescription>{STEPS[step].description}</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>
          )}

          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Pharmacy Name</Label>
                <Input id="name" {...form.register('name')} placeholder="Main Street Pharmacy" />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="npi">NPI Number</Label>
                <Input id="npi" {...form.register('npi')} placeholder="1234567890" maxLength={10} />
                {form.formState.errors.npi && (
                  <p className="text-sm text-destructive">{form.formState.errors.npi.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" {...form.register('phone')} placeholder="(555) 123-4567" />
                {form.formState.errors.phone && (
                  <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
                )}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input id="address" {...form.register('address')} placeholder="123 Main St" />
                {form.formState.errors.address && (
                  <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...form.register('city')} placeholder="New York" />
                  {form.formState.errors.city && (
                    <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" {...form.register('state')} placeholder="NY" maxLength={2} />
                  {form.formState.errors.state && (
                    <p className="text-sm text-destructive">{form.formState.errors.state.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input id="zip" {...form.register('zip')} placeholder="10001" />
                {form.formState.errors.zip && (
                  <p className="text-sm text-destructive">{form.formState.errors.zip.message}</p>
                )}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>Pharmacy Type</Label>
                <Select
                  value={form.watch('pharmacy_type')}
                  onValueChange={(v) => form.setValue('pharmacy_type', v as PharmacyOnboardingData['pharmacy_type'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pharmacy type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PHARMACY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Pharmacy Management System</Label>
                <Select
                  value={form.watch('pms_system')}
                  onValueChange={(v) => form.setValue('pms_system', v as PharmacyOnboardingData['pms_system'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your PMS" />
                  </SelectTrigger>
                  <SelectContent>
                    {PMS_SYSTEMS.map((pms) => (
                      <SelectItem key={pms.value} value={pms.value}>
                        {pms.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={prevStep} disabled={step === 0}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={loading}>
              {loading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}
