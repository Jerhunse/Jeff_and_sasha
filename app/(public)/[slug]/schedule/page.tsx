import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PaperCard } from "@/components/ui/paper-card"
import { FloralDivider } from "@/components/wedding"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Shirt } from "lucide-react"

interface SchedulePageProps {
  params: Promise<{ slug: string }>
}

async function getScheduleData(slug: string) {
  const wedding = await prisma.couple.findUnique({
    where: { slug },
    include: {
      events: {
        where: { visibility: "PUBLIC" },
        orderBy: { startTime: "asc" },
      },
    },
  })

  if (!wedding || !wedding.isPublished) {
    return null
  }

  return wedding
}

export default async function SchedulePage({ params }: SchedulePageProps) {
  const { slug } = await params
  const wedding = await getScheduleData(slug)

  if (!wedding) {
    notFound()
  }

  return (
    <PaperCard>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-cursive text-5xl md:text-6xl text-gold mb-4">
            Wedding Schedule
          </h1>
          <p className="text-lg text-muted-foreground">
            {new Date(wedding.weddingDate).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        <FloralDivider />

        {wedding.events.length === 0 ? (
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-8 text-center">
              <p className="text-muted-foreground">
                Schedule details coming soon! Check back for updates.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {wedding.events.map((event, index) => (
              <Card key={event.id} className="card-hover border-border/50 bg-card/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="font-cursive">
                          Event {index + 1}
                        </Badge>
                        {event.attire && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Shirt className="h-3 w-3 text-gold" />
                            {event.attire}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="font-cursive text-3xl text-gold">
                        {event.name}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {event.description && (
                    <p className="text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                  )}

                  <div className="flex flex-col gap-3 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                        <Calendar className="h-4 w-4 text-gold" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {new Date(event.startTime).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                        <Clock className="h-4 w-4 text-gold" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {new Date(event.startTime).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                          {event.endTime && (
                            <>
                              {" - "}
                              {new Date(event.endTime).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {event.location && (
                      <div className="flex items-start gap-3 text-sm">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 flex-shrink-0">
                          <MapPin className="h-4 w-4 text-gold" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{event.location}</p>
                          {event.address && (
                            <p className="text-muted-foreground mt-1">{event.address}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PaperCard>
  )
}

