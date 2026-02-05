import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Globe, Calendar, DollarSign, Info } from "lucide-react"

interface Hotel {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  phone: string | null
  website: string | null
  code: string | null
  specialRate: string | null
  deadline: Date | null
  distanceFromVenue: string | null
  amenities: string | null
}

interface TravelSectionProps {
  venueName?: string | null
  venueAddress?: string | null
  venueCity?: string | null
  venueState?: string | null
  venueZip?: string | null
  hotels: Hotel[]
}

export function TravelSection({
  venueName,
  venueAddress,
  venueCity,
  venueState,
  venueZip,
  hotels,
}: TravelSectionProps) {
  return (
    <section id="travel" className="scroll-mt-20 relative">
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        {/* Header — matches timeline section */}
        <header className="text-center mb-16 md:mb-24">
          <h2 className="font-heading text-4xl md:text-5xl lg:text-7xl text-gold mb-4 drop-shadow-sm">
            Travel & Accommodations
          </h2>
          <p className="font-sans text-base md:text-xl lg:text-2xl tracking-[0.2em] uppercase text-foreground/90">
            Everything you need to know for your visit
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="h-px w-8 md:w-12 bg-gold" />
            <p className="font-serif italic text-base md:text-lg text-muted-foreground">
              Venue, hotels & directions
            </p>
            <div className="h-px w-8 md:w-12 bg-gold" />
          </div>
        </header>

        {/* Venue Information */}
        {(venueName || venueAddress) && (
          <Card className="mb-8 rounded-lg bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-md">
            <CardHeader>
              <CardTitle className="font-heading text-xl md:text-2xl lg:text-3xl text-gold">Wedding Venue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {venueName && (
                  <div>
                    <h3 className="font-serif text-xl md:text-2xl lg:text-3xl text-foreground uppercase tracking-wide mb-2">{venueName}</h3>
                  </div>
                )}
                {venueAddress && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="text-sm md:text-base text-muted-foreground">
                      <p>{venueAddress}</p>
                      {(venueCity || venueState || venueZip) && (
                        <p>
                          {[venueCity, venueState, venueZip]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Map Links */}
                {venueAddress && (
                  <div className="space-y-4">
                    {/* Only show embed if API key is configured */}
                    {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
                      <div className="aspect-video w-full rounded-lg overflow-hidden border">
                        <iframe
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(
                            [venueAddress, venueCity, venueState, venueZip]
                              .filter(Boolean)
                              .join(", ")
                          )}`}
                        />
                      </div>
                    )}
                    
                    {/* Note for guests */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <p className="text-sm text-amber-900 dark:text-amber-200 flex items-start gap-2">
                        <Info className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>
                          <strong>Important:</strong> Please use Google Maps for directions. Apple Maps may not direct you to the correct location.
                        </span>
                      </p>
                    </div>
                    
                    <Button asChild variant="outline" className="w-full min-h-[44px]">
                      <a
                        href="https://share.google/BQng1GFNuxbDEQf5T"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Open in Google Maps
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        {/* Hotel Accommodations */}
        <div className="mt-12 md:mt-16 mb-8">
          <div className="h-px w-24 md:w-32 bg-gold/30 mx-auto mb-8 md:mb-12" />
          <h2 className="font-heading text-4xl md:text-5xl lg:text-7xl text-gold mb-6 text-center drop-shadow-sm">
            Where to Stay
          </h2>

          {hotels.length === 0 ? (
            <Card className="rounded-lg bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-md">
              <CardContent className="pt-8 text-center">
                <p className="font-serif italic text-muted-foreground">
                  Hotel recommendations coming soon!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {hotels.map((hotel) => (
                <Card key={hotel.id} className="card-hover rounded-lg bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-md">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                      <CardTitle className="font-serif text-lg md:text-xl lg:text-2xl text-foreground uppercase tracking-wide">{hotel.name}</CardTitle>
                      {hotel.code && (
                        <Badge variant="default" className="shrink-0">Room Block</Badge>
                      )}
                    </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-3 text-xs md:text-sm text-muted-foreground leading-relaxed">
                        <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p>{hotel.address}</p>
                          <p>{hotel.city}, {hotel.state} {hotel.zip}</p>
                        </div>
                      </div>

                      {hotel.distanceFromVenue && (
                        <div className="flex items-center gap-3 text-xs md:text-sm text-muted-foreground">
                          <Info className="h-4 w-4 text-primary shrink-0" />
                          <p>{hotel.distanceFromVenue} from venue</p>
                        </div>
                      )}

                      {hotel.phone && (
                        <div className="flex items-center gap-3 text-xs md:text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 text-primary shrink-0" />
                          <a href={`tel:${hotel.phone}`} className="hover:underline text-foreground">
                            {hotel.phone}
                          </a>
                        </div>
                      )}

                      {hotel.code && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 md:p-4 space-y-2">
                          <div className="flex items-center gap-2 font-semibold text-xs md:text-sm">
                            <DollarSign className="h-4 w-4 text-primary shrink-0" />
                            <span>Special Rate Available</span>
                          </div>
                          <p className="text-xs md:text-sm">
                            <span className="font-medium">Block Code:</span>{" "}
                            <code className="bg-background px-2 py-1 rounded">
                              {hotel.code}
                            </code>
                          </p>
                          {hotel.deadline && (
                            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 shrink-0" />
                              <span>
                                Book by{" "}
                                {new Date(hotel.deadline).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {hotel.specialRate && (
                            <p className="text-xs md:text-sm text-muted-foreground">
                              {hotel.specialRate}
                            </p>
                          )}
                        </div>
                      )}

                      {hotel.amenities && (
                        <div className="text-xs md:text-sm text-muted-foreground font-serif pt-2 border-t">
                          <p className="font-medium mb-1">Amenities:</p>
                          <p>{hotel.amenities}</p>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        {hotel.website && (
                          <Button asChild variant="outline" size="sm" className="flex-1 min-h-[44px]">
                            <a
                              href={hotel.website}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Globe className="h-4 w-4 mr-2" />
                              Visit Website
                            </a>
                          </Button>
                        )}
                        <Button asChild variant="outline" size="sm" className="flex-1 min-h-[44px]">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${hotel.name} ${hotel.address} ${hotel.city} ${hotel.state}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MapPin className="h-4 w-4 mr-2" />
                            Directions
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
        </div>
      </div>
    </section>
  )
}
