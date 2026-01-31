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
          <h2 className="font-heading text-4xl md:text-5xl lg:text-7xl text-gold mb-4 drop-shadow-sm">
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
        <div className="relative">
          {/* Central timeline line — fades at top and bottom */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-px h-full hidden md:block"
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, var(--color-gold, #C5A059) 10%, var(--color-gold, #C5A059) 90%, transparent 100%)",
            }}
          />

          {events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground font-serif italic">
              Schedule details coming soon! Check back for updates.
            </div>
          ) : (
            <div className="space-y-16 md:space-y-24 lg:space-y-32">
              {events.map((event, index) => {
                const Icon = getEventIcon(index)
                const isLeft = index % 2 === 0
                const contentBlock = (
                  <div
                    className="rounded-lg bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-md py-3 px-4 md:py-4 md:px-5"
                    style={{
                      maskImage:
                        "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
                      WebkitMaskImage:
                        "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
                    }}
                  >
                    <span className="block font-sans text-gold text-xs tracking-[0.2em] uppercase mb-1">
                      {new Date(event.startTime).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                    <h3 className="font-serif text-xl md:text-2xl lg:text-3xl mb-2 text-foreground uppercase tracking-wide">
                      {event.name}
                    </h3>
                    {event.description && (
                      <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                        {event.description}
                      </p>
                    )}
                    {event.location && (
                      <p className="mt-2 text-muted-foreground/80 text-xs italic">
                        {event.location}
                      </p>
                    )}
                  </div>
                )
                return (
                  <div
                    key={event.id}
                    className="relative flex flex-col md:flex-row items-center justify-center group"
                  >
                    {/* Left slot: content when isLeft, else spacer */}
                    <div
                      className={`md:w-1/2 md:pr-8 lg:pr-16 text-center md:text-right order-2 md:order-1 mt-4 md:mt-0 ${
                        !isLeft ? "hidden md:block" : ""
                      }`}
                    >
                      {isLeft ? contentBlock : null}
                    </div>

                    {/* Center icon */}
                    <div className="relative z-10 w-12 h-12 md:w-16 md:h-16 bg-background border-2 border-gold rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 order-1 md:order-2 shrink-0">
                      <Icon className="h-6 w-6 md:h-7 md:w-7 text-gold" strokeWidth={1.5} />
                    </div>

                    {/* Right slot: content when !isLeft, else spacer */}
                    <div
                      className={`md:w-1/2 md:pl-8 lg:pl-16 text-center md:text-left order-3 mt-4 md:mt-0 ${
                        isLeft ? "hidden md:block" : ""
                      }`}
                    >
                      {!isLeft ? contentBlock : null}
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
