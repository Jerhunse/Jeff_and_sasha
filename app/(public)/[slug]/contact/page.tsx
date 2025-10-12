import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, MessageCircle, CheckCircle, AlertCircle } from "lucide-react"

interface ContactPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ success?: string; error?: string }>
}

async function getWeddingData(slug: string) {
  const wedding = await prisma.couple.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      partner1Name: true,
      partner2Name: true,
      isPublished: true,
      venueName: true,
      venueCity: true,
      venueState: true,
    },
  })

  if (!wedding || !wedding.isPublished) {
    return null
  }

  return wedding
}

export default async function ContactPage({ params, searchParams }: ContactPageProps) {
  const { slug } = await params
  const { success, error } = await searchParams
  const wedding = await getWeddingData(slug)

  if (!wedding) {
    notFound()
  }

  return (
    <div className="container py-16">
      <div className="max-w-5xl mx-auto">
        {success && (
          <Card className="mb-8 bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">
                    Message sent successfully!
                  </h3>
                  <p className="text-sm text-green-700">
                    Thank you for reaching out. We'll get back to you soon!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="mb-8 bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">
                    Something went wrong
                  </h3>
                  <p className="text-sm text-red-700">
                    {error === "missing_fields"
                      ? "Please fill in all required fields."
                      : error === "not_found"
                      ? "Wedding not found."
                      : "An error occurred. Please try again later."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <MessageCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">
            Get In Touch
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have a question about our wedding? We'd love to hear from you!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">Email Us</p>
                    <p className="text-sm text-muted-foreground">
                      We'll respond within 24 hours
                    </p>
                  </div>
                </div>

                {wedding.venueName && (
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 flex-shrink-0">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">Venue</p>
                      <p className="text-sm text-muted-foreground">
                        {wedding.venueName}
                        {(wedding.venueCity || wedding.venueState) && (
                          <>
                            <br />
                            {[wedding.venueCity, wedding.venueState]
                              .filter(Boolean)
                              .join(", ")}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <h3 className="font-serif text-lg font-bold mb-3">Common Questions?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Check our FAQ page for quick answers to common questions about the
                  wedding, venue, accommodations, and more.
                </p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <a href={`/${slug}/faq`}>View FAQ</a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Send Us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={`/api/contact/${slug}`} method="POST" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="RSVP Question"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Your Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us what's on your mind..."
                      className="min-h-[150px]"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-sm text-muted-foreground">
                      * Required fields
                    </p>
                    <Button type="submit" size="lg">
                      Send Message
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="mt-6 bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <p className="text-sm text-center">
                  <strong>Need urgent assistance?</strong> For time-sensitive matters,
                  please reach out directly to a member of the wedding party.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

