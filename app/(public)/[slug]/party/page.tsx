import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users } from "lucide-react"
import { WeddingPartyRole } from "@prisma/client"

interface PartyPageProps {
  params: Promise<{ slug: string }>
}

async function getWeddingPartyData(slug: string) {
  const wedding = await prisma.couple.findUnique({
    where: { slug },
    include: {
      weddingParty: {
        orderBy: { order: "asc" },
      },
    },
  })

  if (!wedding || !wedding.isPublished) {
    return null
  }

  return wedding
}

function getRoleLabel(role: WeddingPartyRole, customLabel?: string | null): string {
  if (role === "OTHER" && customLabel) {
    return customLabel
  }
  
  const roleLabels: Record<WeddingPartyRole, string> = {
    BRIDE: "Bride",
    GROOM: "Groom",
    MAID_OF_HONOR: "Maid of Honor",
    BEST_MAN: "Best Man",
    BRIDESMAID: "Bridesmaid",
    GROOMSMAN: "Groomsman",
    OFFICIANT: "Officiant",
    FLOWER_GIRL: "Flower Girl",
    RING_BEARER: "Ring Bearer",
    USHER: "Usher",
    READER: "Reader",
    OTHER: "Wedding Party",
  }
  
  return roleLabels[role]
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default async function WeddingPartyPage({ params }: PartyPageProps) {
  const { slug } = await params
  const wedding = await getWeddingPartyData(slug)

  if (!wedding) {
    notFound()
  }

  // Group wedding party by role categories
  const honoredGuests = wedding.weddingParty.filter((m) =>
    ["BRIDE", "GROOM"].includes(m.role)
  )
  const honorAttendants = wedding.weddingParty.filter((m) =>
    ["MAID_OF_HONOR", "BEST_MAN"].includes(m.role)
  )
  const bridalParty = wedding.weddingParty.filter((m) =>
    ["BRIDESMAID"].includes(m.role)
  )
  const groomsParty = wedding.weddingParty.filter((m) =>
    ["GROOMSMAN"].includes(m.role)
  )
  const others = wedding.weddingParty.filter((m) =>
    ["OFFICIANT", "FLOWER_GIRL", "RING_BEARER", "USHER", "READER", "OTHER"].includes(m.role)
  )

  return (
    <div className="container py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">
            Our Wedding Party
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Meet the special people standing beside us on our big day
          </p>
        </div>

        {wedding.weddingParty.length === 0 ? (
          <Card>
            <CardContent className="pt-8 text-center py-12">
              <p className="text-muted-foreground">
                Wedding party details coming soon!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-16">
            {/* Honored Guests - Bride & Groom */}
            {honoredGuests.length > 0 && (
              <section>
                <h2 className="font-serif text-3xl font-bold text-center mb-8">
                  The Happy Couple
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {honoredGuests.map((member) => (
                    <Card key={member.id} className="card-hover overflow-hidden">
                      <div className="aspect-square w-full overflow-hidden bg-muted">
                        {member.imageUrl ? (
                          <img
                            src={member.imageUrl}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Avatar className="h-32 w-32">
                              <AvatarFallback className="text-4xl">
                                {getInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                      </div>
                      <CardContent className="pt-6 text-center">
                        <Badge variant="outline" className="mb-3">
                          {getRoleLabel(member.role, member.roleLabel)}
                        </Badge>
                        <h3 className="font-serif text-2xl font-bold mb-2">
                          {member.name}
                        </h3>
                        {member.relationship && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {member.relationship}
                          </p>
                        )}
                        {member.bio && (
                          <p className="text-sm leading-relaxed">{member.bio}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Honor Attendants */}
            {honorAttendants.length > 0 && (
              <section>
                <h2 className="font-serif text-3xl font-bold text-center mb-8">
                  Honor Attendants
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {honorAttendants.map((member) => (
                    <Card key={member.id} className="card-hover overflow-hidden">
                      <div className="aspect-square w-full overflow-hidden bg-muted">
                        {member.imageUrl ? (
                          <img
                            src={member.imageUrl}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Avatar className="h-32 w-32">
                              <AvatarFallback className="text-4xl">
                                {getInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                      </div>
                      <CardContent className="pt-6 text-center">
                        <Badge variant="outline" className="mb-3">
                          {getRoleLabel(member.role, member.roleLabel)}
                        </Badge>
                        <h3 className="font-serif text-2xl font-bold mb-2">
                          {member.name}
                        </h3>
                        {member.relationship && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {member.relationship}
                          </p>
                        )}
                        {member.bio && (
                          <p className="text-sm leading-relaxed">{member.bio}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Bridesmaids and Groomsmen */}
            {(bridalParty.length > 0 || groomsParty.length > 0) && (
              <section>
                <h2 className="font-serif text-3xl font-bold text-center mb-8">
                  The Wedding Party
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...bridalParty, ...groomsParty].map((member) => (
                    <Card key={member.id} className="card-hover overflow-hidden">
                      <div className="aspect-square w-full overflow-hidden bg-muted">
                        {member.imageUrl ? (
                          <img
                            src={member.imageUrl}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Avatar className="h-24 w-24">
                              <AvatarFallback className="text-2xl">
                                {getInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                      </div>
                      <CardContent className="pt-6 text-center">
                        <Badge variant="secondary" className="mb-3 text-xs">
                          {getRoleLabel(member.role, member.roleLabel)}
                        </Badge>
                        <h3 className="font-serif text-xl font-bold mb-2">
                          {member.name}
                        </h3>
                        {member.relationship && (
                          <p className="text-xs text-muted-foreground mb-2">
                            {member.relationship}
                          </p>
                        )}
                        {member.bio && (
                          <p className="text-sm leading-relaxed">{member.bio}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Other Roles */}
            {others.length > 0 && (
              <section>
                <h2 className="font-serif text-3xl font-bold text-center mb-8">
                  Special Roles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {others.map((member) => (
                    <Card key={member.id} className="card-hover overflow-hidden">
                      <div className="aspect-square w-full overflow-hidden bg-muted">
                        {member.imageUrl ? (
                          <img
                            src={member.imageUrl}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Avatar className="h-24 w-24">
                              <AvatarFallback className="text-2xl">
                                {getInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                      </div>
                      <CardContent className="pt-6 text-center">
                        <Badge variant="secondary" className="mb-3 text-xs">
                          {getRoleLabel(member.role, member.roleLabel)}
                        </Badge>
                        <h3 className="font-serif text-xl font-bold mb-2">
                          {member.name}
                        </h3>
                        {member.relationship && (
                          <p className="text-xs text-muted-foreground mb-2">
                            {member.relationship}
                          </p>
                        )}
                        {member.bio && (
                          <p className="text-sm leading-relaxed">{member.bio}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

