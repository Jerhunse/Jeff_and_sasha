"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UtensilsCrossed } from "lucide-react"

interface MealDistributionChartProps {
  data: Array<{ meal_choice: string; count: number }>
}

export function MealDistributionChart({ data }: MealDistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5" />
            Meal Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No meal choices yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const total = data.reduce((sum, item) => sum + Number(item.count), 0)
  const colors = [
    "bg-blue-600",
    "bg-green-600",
    "bg-yellow-600",
    "bg-purple-600",
    "bg-pink-600",
    "bg-indigo-600",
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5" />
          Meal Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Stacked bar */}
          <div className="flex h-8 rounded-lg overflow-hidden">
            {data.map((item, index) => (
              <div
                key={index}
                className={`${colors[index % colors.length]} flex items-center justify-center text-xs font-medium text-white`}
                style={{
                  width: `${(Number(item.count) / total) * 100}%`,
                }}
                title={`${item.meal_choice}: ${item.count}`}
              >
                {((Number(item.count) / total) * 100).toFixed(0)}%
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded ${colors[index % colors.length]}`}
                  />
                  <span className="text-sm">{item.meal_choice || "Unknown"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{item.count}</span>
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {((Number(item.count) / total) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total</span>
              <span className="text-lg font-bold">{total}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

