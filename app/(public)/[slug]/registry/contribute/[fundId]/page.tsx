import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Heart, DollarSign, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ContributionPageProps {
  params: Promise<{ slug: string; fundId: string }>
}

async function getCashFundData(fundId: string, slug: string) {
  const fund = await prisma.cashFund.findFirst({
    where: {
      id: fundId,
      couple: { slug },
      isActive: true,
    },
    include: {
      couple: {
        select: {
          slug: true,
          partner1Name: true,
          partner2Name: true,
          isPublished: true,
        },
      },
    },
  })

  if (!fund || !fund.couple.isPublished) {
    return null
  }

  return fund
}

export default async function ContributionPage({ params }: ContributionPageProps) {
  const { slug, fundId } = await params
  const fund = await getCashFundData(fundId, slug)

  if (!fund) {
    notFound()
  }

  const progressPercentage = fund.goal
    ? Math.min((fund.received / fund.goal) * 100, 100)
    : 0

  const presetAmounts = [25, 50, 100, 250, 500]

  return (
    <div className="container py-16">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/${slug}/registry`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Registry
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Fund Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-serif text-2xl text-center">
                  {fund.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fund.imageUrl && (
                  <div className="aspect-video w-full rounded-lg overflow-hidden">
                    <img
                      src={fund.imageUrl}
                      alt={fund.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {fund.description && (
                  <p className="text-sm text-center">{fund.description}</p>
                )}

                {fund.goal && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">
                        ${fund.received.toFixed(0)}
                      </span>
                      <span className="text-muted-foreground">
                        ${fund.goal.toFixed(0)}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      {progressPercentage.toFixed(0)}% of goal reached
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contribution Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl">
                  Make a Contribution
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Help {fund.couple.partner1Name} & {fund.couple.partner2Name} celebrate
                  their special day
                </p>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  {/* Preset Amounts */}
                  <div className="space-y-2">
                    <Label>Select Amount</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {presetAmounts.map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          variant="outline"
                          className="w-full"
                        >
                          ${amount}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="amount">Or Enter Custom Amount *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        min="1"
                        step="1"
                        placeholder="100"
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  {/* Contributor Info */}
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

                  {/* Optional Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">Personal Message (Optional)</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Congratulations on your special day!"
                      className="min-h-[100px]"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Card className="bg-amber-50 border-amber-200 mb-4">
                      <CardContent className="pt-6">
                        <p className="text-sm text-amber-900 text-center">
                          <strong>Note:</strong> Stripe integration is in development. This is a
                          preview of the contribution flow. Full payment processing will be
                          available soon.
                        </p>
                      </CardContent>
                    </Card>

                    <Button type="submit" size="lg" className="w-full" disabled>
                      <Heart className="h-4 w-4 mr-2" />
                      Continue to Payment
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Secure payment processing powered by Stripe
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

