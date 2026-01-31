"use client"

import { Card } from "@/components/ui/card"
import { Users, UserCheck, UserX, Clock, Home, Mail } from "lucide-react"

interface KPI {
  totalGuests: number
  yes: number
  no: number
  maybe: number
  pending: number
  households: number
}

interface KPITilesProps {
  data: KPI
}

export function KPITiles({ data }: KPITilesProps) {
  const tiles = [
    {
      label: "Total Guests",
      value: data.totalGuests,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-600/10",
    },
    {
      label: "Attending",
      value: data.yes,
      icon: UserCheck,
      color: "text-white",
      bgColor: "bg-green-600/10",
      percentage: data.totalGuests > 0
        ? `${((data.yes / data.totalGuests) * 100).toFixed(1)}%`
        : "0%",
    },
    {
      label: "Declined",
      value: data.no,
      icon: UserX,
      color: "text-red-600",
      bgColor: "bg-red-600/10",
      percentage: data.totalGuests > 0
        ? `${((data.no / data.totalGuests) * 100).toFixed(1)}%`
        : "0%",
    },
    {
      label: "Pending",
      value: data.pending,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-600/10",
      percentage: data.totalGuests > 0
        ? `${((data.pending / data.totalGuests) * 100).toFixed(1)}%`
        : "0%",
    },
    {
      label: "Households",
      value: data.households,
      icon: Home,
      color: "text-purple-600",
      bgColor: "bg-purple-600/10",
    },
    {
      label: "Maybe",
      value: data.maybe,
      icon: Mail,
      color: "text-orange-600",
      bgColor: "bg-orange-600/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {tiles.map((tile) => {
        const Icon = tile.icon
        return (
          <Card key={tile.label} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">
                {tile.label}
              </span>
              <div className={`p-2 rounded-lg ${tile.bgColor}`}>
                <Icon className={`h-4 w-4 ${tile.color}`} />
              </div>
            </div>
            <div className="space-y-1">
              <div className={`text-3xl font-bold ${tile.color}`}>
                {tile.value}
              </div>
              {tile.percentage && (
                <p className="text-xs text-muted-foreground">
                  {tile.percentage} of total
                </p>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

