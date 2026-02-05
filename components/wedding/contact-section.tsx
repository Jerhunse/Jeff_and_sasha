"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MapPin, MessageCircle } from "lucide-react"

interface ContactSectionProps {
  slug: string
  venueName?: string | null
  venueCity?: string | null
  venueState?: string | null
}

export function ContactSection({ slug, venueName, venueCity, venueState }: ContactSectionProps) {
  return (
    <section id="contact" className="scroll-mt-20 relative">
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        {/* Header — matches timeline section */}
        <header className="text-center mb-16 md:mb-24">
          <h2 className="font-heading text-4xl md:text-5xl lg:text-7xl text-gold mb-4 drop-shadow-sm">
            Get In Touch
          </h2>
          <p className="font-sans text-base md:text-xl lg:text-2xl tracking-[0.2em] uppercase text-foreground/90">
            We'd Love To Hear From You
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="h-px w-8 md:w-12 bg-gold" />
            <p className="font-serif italic text-base md:text-lg text-muted-foreground">
              Have a question about our wedding?
            </p>
            <div className="h-px w-8 md:w-12 bg-gold" />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Contact Info */}
          <div className="space-y-4 md:space-y-6">
            <Card 
              className="rounded-lg bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-md"
              style={{
                maskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
              }}
            >
              <CardHeader>
                <CardTitle className="font-heading text-lg md:text-xl text-gold">Quick Info</CardTitle>
              </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 flex-shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">Email Us</p>
                    <p className="text-xs md:text-sm font-serif italic text-muted-foreground">
                      We'll respond within 24 hours
                    </p>
                  </div>
                  </div>

                  {venueName && (
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 flex-shrink-0">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">Venue</p>
                        <p className="text-xs md:text-sm font-serif italic text-muted-foreground">
                          {venueName}
                          {(venueCity || venueState) && (
                            <>
                              <br />
                              {[venueCity, venueState]
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

            <Card 
              className="bg-muted/50 border-border/50"
              style={{
                maskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
              }}
            >
              <CardContent className="pt-6">
                <h3 className="font-heading text-base md:text-lg text-gold mb-3">Common Questions?</h3>
                <p className="text-xs md:text-sm font-serif italic text-muted-foreground mb-4">
                  Check our FAQ page for quick answers to common questions about the
                  wedding, venue, accommodations, and more.
                </p>
                <Button asChild variant="outline" size="sm" className="w-full min-h-[44px]">
                  <a href="#faq">View FAQ</a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card 
              className="rounded-lg bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-md"
              style={{
                maskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
              }}
            >
              <CardHeader>
                <CardTitle className="font-heading text-xl md:text-2xl lg:text-3xl text-gold drop-shadow-sm">Send Us a Message</CardTitle>
              </CardHeader>
                <CardContent>
                  <form action={`/api/contact/${slug}`} method="POST" className="space-y-4 md:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm md:text-base">Your Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="John Doe"
                          required
                          className="min-h-[44px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm md:text-base">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          required
                          className="min-h-[44px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm md:text-base">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="(555) 123-4567"
                          className="min-h-[44px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-sm md:text-base">Subject</Label>
                        <Input
                          id="subject"
                          name="subject"
                          placeholder="RSVP Question"
                          className="min-h-[44px]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm md:text-base">Your Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us what's on your mind..."
                        className="min-h-[120px] md:min-h-[150px]"
                        required
                      />
                    </div>

                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-2">
                    <p className="text-xs md:text-sm font-serif italic text-muted-foreground">
                      * Required fields
                    </p>
                    <Button type="submit" size="lg" className="w-full md:w-auto min-h-[44px] px-8">
                      Send Message
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card 
              className="mt-6 bg-primary/5 border-primary/20"
              style={{
                maskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
              }}
            >
              <CardContent className="pt-6">
                <p className="text-xs md:text-sm text-center font-serif text-muted-foreground">
                  <strong>Need urgent assistance?</strong> For time-sensitive matters,
                  please reach out directly to a member of the wedding party.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
