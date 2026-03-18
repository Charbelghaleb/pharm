'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PHARMACY_TYPES, PMS_SYSTEMS } from '@/lib/validations/pharmacy'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function SettingsPage() {
  const queryClient = useQueryClient()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetch('/api/pharmacy')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  const pharmacy = profile?.pharmacies

  const [form, setForm] = useState({
    name: '',
    npi: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    pharmacy_type: 'retail',
    pms_system: 'other',
  })

  useEffect(() => {
    if (pharmacy) {
      setForm({
        name: pharmacy.name || '',
        npi: pharmacy.npi || '',
        phone: pharmacy.phone || '',
        address: pharmacy.address || '',
        city: pharmacy.city || '',
        state: pharmacy.state || '',
        zip: pharmacy.zip || '',
        pharmacy_type: pharmacy.pharmacy_type || 'retail',
        pms_system: pharmacy.pms_system || 'other',
      })
    }
  }, [pharmacy])

  const updateMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch('/api/pharmacy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  if (isLoading) return <div className="text-muted-foreground">Loading...</div>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your pharmacy profile and account settings</p>
      </div>

      <Tabs defaultValue="pharmacy">
        <TabsList>
          <TabsTrigger value="pharmacy">Pharmacy Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="pharmacy">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Pharmacy Information</CardTitle>
              <CardDescription>Update your pharmacy details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pharmacy Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>NPI</Label>
                  <Input
                    value={form.npi}
                    onChange={(e) => setForm({ ...form, npi: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ZIP</Label>
                  <Input
                    value={form.zip}
                    onChange={(e) => setForm({ ...form, zip: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pharmacy Type</Label>
                  <Select
                    value={form.pharmacy_type}
                    onValueChange={(v) => setForm({ ...form, pharmacy_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label>PMS System</Label>
                  <Select
                    value={form.pms_system}
                    onValueChange={(v) => setForm({ ...form, pms_system: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
              </div>

              <Button
                onClick={() => updateMutation.mutate(form)}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>

              {updateMutation.isSuccess && (
                <p className="text-sm text-green-600">Settings saved successfully</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your personal account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={profile?.full_name ?? ''} disabled />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profile?.email ?? ''} disabled />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={profile?.role ?? ''} disabled />
              </div>
              <p className="text-xs text-muted-foreground">
                Contact your pharmacy owner to update account details.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
