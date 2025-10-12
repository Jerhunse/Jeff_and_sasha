import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Globe, Calendar, DollarSign, Info } from "lucide-react"

interface TravelPageProps {
  params: Promise<{ slug: string }>
}

async function getTravelData(slug: string) {
  const wedding = await prisma.couple.findUnique({
    where: { slug },
    include: {
      hotels: {
        orderBy: { order: "asc" },
      },
    },
  })

  if (!wedding || !wedding.isPublished) {
    return null
  }

  return wedding
}

export default async function TravelPage({ params }: TravelPageProps) {
  const { slug } = await params
  const wedding = await getTravelData(slug)

  if (!wedding) {
    notFound()
  }

  return (
    <div className="container py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">
            Travel & Accommodations
          </h1>
          <p className="text-lg text-muted-foreground">
            Everything you need to know for your visit
          </p>
        </div>

        {/* Venue Information */}
        {(wedding.venueName || wedding.venueAddress) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-serif text-3xl">Wedding Venue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {wedding.venueName && (
                <div>
                  <h3 className="font-semibold text-xl mb-2">{wedding.venueName}</h3>
                </div>
              )}
              {wedding.venueAddress && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p>{wedding.venueAddress}</p>
                    {(wedding.venueCity || wedding.venueState || wedding.venueZip) && (
                      <p>
                        {[wedding.venueCity, wedding.venueState, wedding.venueZip]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Google Maps Embed */}
              {wedding.venueAddress && (
                <div className="space-y-4">
                  <div className="aspect-video w-full rounded-lg overflow-hidden border">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${encodeURIComponent(
                        [
                          wedding.venueAddress,
                          wedding.venueCity,
                          wedding.venueState,
                          wedding.venueZip,
                        ]
                          .filter(Boolean)
                          .join(", ")
                      )}`}
                    />
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        [
                          wedding.venueAddress,
                          wedding.venueCity,
                          wedding.venueState,
                          wedding.venueZip,
                        ]
                          .filter(Boolean)
                          .join(", ")
                      )}`}
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
        <div className="mb-8">
          <h2 className="font-serif text-3xl font-bold mb-6">Where to Stay</h2>

          {wedding.hotels.length === 0 ? (
            <Card>
              <CardContent className="pt-8 text-center">
                <p className="text-muted-foreground">
                  Hotel recommendations coming soon!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {wedding.hotels.map((hotel) => (
                <Card key={hotel.id} className="card-hover">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="font-serif text-2xl">{hotel.name}</CardTitle>
                      {hotel.blockCode && (
                        <Badge variant="default">Room Block</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p>{hotel.address}</p>
                        <p>{hotel.city}, {hotel.state} {hotel.zip}</p>
                      </div>
                    </div>

                    {hotel.distanceFromVenue && (
                      <div className="flex items-center gap-3 text-sm">
                        <Info className="h-4 w-4 text-primary" />
                        <p>{hotel.distanceFromVenue} from venue</p>
                      </div>
                    )}

                    {hotel.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-primary" />
                        <a href={`tel:${hotel.phone}`} className="hover:underline">
                          {hotel.phone}
                        </a>
                      </div>
                    )}

                    {hotel.blockCode && (
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-sm">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <span>Special Rate Available</span>
                        </div>
                        <p className="text-sm">
                          <span className="font-medium">Block Code:</span>{" "}
                          <code className="bg-background px-2 py-1 rounded">
                            {hotel.blockCode}
                          </code>
                        </p>
                        {hotel.blockDeadline && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Book by{" "}
                              {new Date(hotel.blockDeadline).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {hotel.specialRate && (
                          <p className="text-sm text-muted-foreground">
                            {hotel.specialRate}
                          </p>
                        )}
                      </div>
                    )}

                    {hotel.amenities && (
                      <div className="text-sm text-muted-foreground pt-2 border-t">
                        <p className="font-medium mb-1">Amenities:</p>
                        <p>{hotel.amenities}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {hotel.website && (
                        <Button asChild variant="outline" size="sm" className="flex-1">
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
                      <Button asChild variant="outline" size="sm" className="flex-1">
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
    </div>
  )
}

