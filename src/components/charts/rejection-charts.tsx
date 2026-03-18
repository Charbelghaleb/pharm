'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import type { PieLabelRenderProps } from 'recharts'

const COLORS = ['#e76e50', '#2a9d90', '#274754', '#e8c468', '#f4a462', '#6366f1', '#ec4899', '#14b8a6', '#f97316', '#8b5cf6']

export function TopCodesChart({ data }: { data: { code: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="code" type="category" width={50} />
        <Tooltip />
        <Bar dataKey="count" fill="#e76e50" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function PbmPieChart({ data }: { data: { name: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={(props: PieLabelRenderProps) => `${props.name ?? ''} (${((Number(props.percent) || 0) * 100).toFixed(0)}%)`}
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function InsurancePieChart({ data }: { data: { type: string; count: number }[] }) {
  const formatted = data.map((d) => ({
    ...d,
    type: d.type.replace('_', ' '),
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={formatted}
          dataKey="count"
          nameKey="type"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={(props: PieLabelRenderProps) => `${props.name ?? ''} (${((Number(props.percent) || 0) * 100).toFixed(0)}%)`}
          labelLine={false}
        >
          {formatted.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}
