"use client"

import {
  Heart,
  Wine,
  UtensilsCrossed,
  Cake,
  Music2,
  Sparkles,
  Church,
  type LucideIcon,
} from "lucide-react"

interface Event {
  id: string
  name: string
  description: string | null
  startTime: Date
  endTime: Date | null
  location: string | null
  address: string | null
  attire: string | null
}

interface ScheduleSectionProps {
  events: Event[]
  weddingDate: Date
  partner1Name?: string
  partner2Name?: string
  /** Optional attire for header (e.g. from first event or wedding default) */
  attire?: string | null
}

const TIMELINE_ICONS: LucideIcon[] = [
  Heart,
  Wine,
  UtensilsCrossed,
  Cake,
  Music2,
  Sparkles,
]

function getEventIcon(index: number): LucideIcon {
  return TIMELINE_ICONS[index % TIMELINE_ICONS.length]
}

export function ScheduleSection({
  events,
  weddingDate,
  partner1Name = "",
  partner2Name = "",
  attire,
}: ScheduleSectionProps) {
  const formattedDate = new Date(weddingDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  const coupleNames =
    partner1Name && partner2Name
      ? `${partner1Name.toUpperCase()} & ${partner2Name.toUpperCase()}`
      : ""

  return (
    <section id="schedule" className="scroll-mt-20 relative">
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        {/* Header */}
        <header className="text-center mb-16 md:mb-24">
          <h2 className="font-heading text-4xl md:text-5xl lg:text-7xl text-black mb-4 drop-shadow-sm">
            Wedding Schedule
          </h2>
          {coupleNames && (
            <p className="font-sans text-base md:text-xl lg:text-2xl tracking-[0.2em] uppercase text-foreground/90">
              {coupleNames}
            </p>
          )}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="h-px w-8 md:w-12 bg-gold" />
            <p className="font-serif italic text-base md:text-lg text-muted-foreground">
              {formattedDate}
            </p>
            <div className="h-px w-8 md:w-12 bg-gold" />
          </div>
          {attire && (
            <div className="mt-8 md:mt-12 inline-block">
              <div className="border-[1.5px] border-gold/40 p-1 rounded-sm">
                <div className="border border-gold px-6 md:px-8 py-2 md:py-3 relative">
                  <div className="absolute -top-1 -left-1 bg-background p-0.5">
                    <div className="w-2 h-2 border-t border-l border-gold" />
                  </div>
                  <div className="absolute -top-1 -right-1 bg-background p-0.5">
                    <div className="w-2 h-2 border-t border-r border-gold" />
                  </div>
                  <div className="absolute -bottom-1 -left-1 bg-background p-0.5">
                    <div className="w-2 h-2 border-b border-l border-gold" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-background p-0.5">
                    <div className="w-2 h-2 border-b border-r border-gold" />
                  </div>
                  <p className="font-heading text-xl md:text-2xl lg:text-3xl text-black">
                    {attire}
                  </p>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Timeline */}
        <div className="relative max-w-2xl mx-auto">
          {events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground font-serif italic">
              Schedule details coming soon! Check back for updates.
            </div>
          ) : (
            <div className="space-y-8 md:space-y-10">
              {events.map((event, index) => {
                const isCakeCutting = event.name.toLowerCase().includes("cake cutting")
                const time = isCakeCutting
                  ? "AFTER SUNSET"
                  : new Date(event.startTime).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    }).toUpperCase()
                
                return (
                  <div
                    key={event.id}
                    className="relative flex items-start gap-6 md:gap-8 group"
                  >
                    {/* Time on the left */}
                    <div className="w-28 md:w-32 flex-shrink-0 text-right">
                      <span className="font-serif text-lg md:text-xl text-foreground tracking-wide">
                        {time}
                      </span>
                    </div>

                    {/* Vertical line in the middle */}
                    <div className="relative flex flex-col items-center flex-shrink-0">
                      {/* Line segment above */}
                      {index > 0 && (
                        <div 
                          className="absolute bottom-1/2 w-px bg-foreground/20"
                          style={{ height: index === 0 ? '0' : '2.5rem' }}
                        />
                      )}
                      
                      {/* Dot */}
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 z-10" />
                      
                      {/* Line segment below */}
                      {index < events.length - 1 && (
                        <div 
                          className="absolute top-1/2 w-px bg-foreground/20"
                          style={{ height: '3.5rem' }}
                        />
                      )}
                    </div>

                    {/* Event name on the right */}
                    <div className="flex-1 pt-0">
                      <h3 className="font-serif text-xl md:text-2xl text-foreground uppercase tracking-wide leading-tight">
                        {event.name}
                      </h3>
                      {event.description && (
                        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-2">
                          {event.description}
                        </p>
                      )}
                      {event.location && (
                        <p className="mt-2 text-muted-foreground/80 text-xs italic">
                          {event.location}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-32 text-center pb-20">
          <div className="h-px w-32 bg-gold/30 mx-auto mb-8" />
          <p className="font-serif italic text-muted-foreground text-lg">
            We can&apos;t wait to celebrate this special day with you.
          </p>
          <div className="mt-12 opacity-40">
            <Church className="h-10 w-10 text-gold mx-auto" />
          </div>
        </footer>
      </div>
    </section>
  )
}
