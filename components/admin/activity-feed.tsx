"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Mail,
  Calendar,
  Tag,
  Settings,
  FileText,
  Trash2,
  Edit,
  Plus,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Activity {
  id: string
  action: string
  description: string
  actor: string
  createdAt: Date
}

interface ActivityFeedProps {
  activities: Activity[]
}

const actionIcons: Record<string, any> = {
  CREATED: Plus,
  UPDATED: Edit,
  DELETED: Trash2,
  INVITE_SENT: Mail,
  RSVP_CHANGED: Users,
  TAG_ADDED: Tag,
  MESSAGE_SENT: Mail,
  SEATING_UPDATED: Users,
}

const actionColors: Record<string, string> = {
  CREATED: "bg-green-600/10 text-green-600",
  UPDATED: "bg-blue-600/10 text-blue-600",
  DELETED: "bg-red-600/10 text-red-600",
  INVITE_SENT: "bg-purple-600/10 text-purple-600",
  RSVP_CHANGED: "bg-green-600/10 text-green-600",
  TAG_ADDED: "bg-yellow-600/10 text-yellow-600",
  MESSAGE_SENT: "bg-blue-600/10 text-blue-600",
  SEATING_UPDATED: "bg-indigo-600/10 text-indigo-600",
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            activities.map((activity) => {
              const Icon = actionIcons[activity.action] || FileText
              const colorClass = actionColors[activity.action] || "bg-gray-600/10 text-gray-600"

              return (
                <div
                  key={activity.id}
                  className="flex gap-3 pb-4 border-b last:border-0 last:pb-0"
                >
                  <div className={`p-2 rounded-lg h-fit ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {activity.actor}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

