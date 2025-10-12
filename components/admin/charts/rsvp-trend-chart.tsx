"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

interface RsvpTrendChartProps {
  data: Array<{ date: string; count: number }>
}

export function RsvpTrendChart({ data }: RsvpTrendChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            RSVP Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No RSVP data yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Simple bar chart visualization (can be enhanced with Chart.js/Recharts)
  const maxCount = Math.max(...data.map((d) => d.count))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          RSVP Trend (Last 30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-24">
                {new Date(item.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className="bg-primary h-6 rounded transition-all"
                    style={{
                      width: `${(item.count / maxCount) * 100}%`,
                      minWidth: "20px",
                    }}
                  />
                  <span className="text-sm font-medium">{item.count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

