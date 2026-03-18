'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react'

export default function DashboardPage() {
  const supabase = createClient()

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [rejectionsResult, resolvedResult, revenueResult] = await Promise.all([
        supabase.from('rejections').select('id', { count: 'exact', head: true }),
        supabase.from('rejections').select('id', { count: 'exact', head: true }).eq('status', 'resolved'),
        supabase.from('rejection_resolutions').select('revenue_recovered'),
      ])

      const totalRevenue = revenueResult.data?.reduce(
        (sum, r) => sum + (Number(r.revenue_recovered) || 0), 0
      ) ?? 0

      return {
        totalRejections: rejectionsResult.count ?? 0,
        resolvedRejections: resolvedResult.count ?? 0,
        totalRevenue,
      }
    },
  })

  const statCards = [
    {
      title: 'Total Rejections',
      value: stats?.totalRejections ?? 0,
      icon: AlertCircle,
      description: 'All logged rejections',
    },
    {
      title: 'Resolved',
      value: stats?.resolvedRejections ?? 0,
      icon: CheckCircle,
      description: 'Successfully resolved',
    },
    {
      title: 'Resolution Rate',
      value: stats?.totalRejections
        ? `${Math.round(((stats.resolvedRejections ?? 0) / stats.totalRejections) * 100)}%`
        : '0%',
      icon: Clock,
      description: 'Of all rejections',
    },
    {
      title: 'Revenue Recovered',
      value: `$${(stats?.totalRevenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: 'From resolved rejections',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your pharmacy operations intelligence</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a href="/rejections/log" className="block p-3 rounded-lg border hover:bg-accent transition-colors">
              <div className="font-medium text-sm">Log a Rejection</div>
              <div className="text-xs text-muted-foreground">Record a new claim rejection and get resolution help</div>
            </a>
            <a href="/rejections/lookup" className="block p-3 rounded-lg border hover:bg-accent transition-colors">
              <div className="font-medium text-sm">Look Up Rejection Code</div>
              <div className="text-xs text-muted-foreground">Get plain-English translation of any NCPDP reject code</div>
            </a>
            <a href="/rejections/search" className="block p-3 rounded-lg border hover:bg-accent transition-colors">
              <div className="font-medium text-sm">Search Resolutions</div>
              <div className="text-xs text-muted-foreground">Find crowdsourced solutions from other pharmacies</div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Network Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pharmacies on PharmaClear</span>
                <span className="font-semibold">--</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Rejections resolved this month</span>
                <span className="font-semibold">--</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Revenue recovered network-wide</span>
                <span className="font-semibold">--</span>
              </div>
              <p className="text-xs text-muted-foreground italic mt-4">
                Network stats will populate as more pharmacies join PharmaClear.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
