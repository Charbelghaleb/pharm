'use client'

import { useAnalytics } from '@/lib/queries/rejections'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TopCodesChart, PbmPieChart, InsurancePieChart } from '@/components/charts/rejection-charts'
import { AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react'

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useAnalytics()

  if (isLoading) return <div className="text-muted-foreground">Loading analytics...</div>

  const statCards = [
    {
      title: 'Total Rejections',
      value: analytics?.totalRejections ?? 0,
      icon: AlertCircle,
    },
    {
      title: 'Resolution Rate',
      value: `${analytics?.resolutionRate ?? 0}%`,
      icon: CheckCircle,
    },
    {
      title: 'Avg Resolution Time',
      value: `${analytics?.avgResolveTime ?? 0} min`,
      icon: Clock,
    },
    {
      title: 'Revenue Recovered',
      value: `$${(analytics?.totalRevenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Rejection Analytics</h1>
        <p className="text-muted-foreground">Insights into your pharmacy&apos;s rejection patterns and resolution performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Rejection Codes</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.topCodes?.length > 0 ? (
              <TopCodesChart data={analytics.topCodes} />
            ) : (
              <p className="text-muted-foreground text-center py-8">No rejection data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rejections by PBM</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.byPbm?.length > 0 ? (
              <PbmPieChart data={analytics.byPbm} />
            ) : (
              <p className="text-muted-foreground text-center py-8">No PBM data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rejections by Insurance Type</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.byInsurance?.length > 0 ? (
              <InsurancePieChart data={analytics.byInsurance} />
            ) : (
              <p className="text-muted-foreground text-center py-8">No insurance data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total rejections logged</span>
                <span className="font-semibold">{analytics?.totalRejections ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Successfully resolved</span>
                <span className="font-semibold">{analytics?.resolvedRejections ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average resolution time</span>
                <span className="font-semibold">{analytics?.avgResolveTime ?? 0} minutes</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total revenue recovered</span>
                <span className="font-semibold text-green-600">
                  ${(analytics?.totalRevenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
