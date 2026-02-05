"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Heart } from "lucide-react"
import Link from "next/link"

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/10 to-background p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-primary fill-primary" />
            <span className="font-serif text-3xl font-bold">Wedding Admin</span>
          </Link>
        </div>

        <Card className="border-2">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-serif">Check your email</CardTitle>
            <CardDescription>
              We sent you a magic link to sign in
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              A sign in link has been sent to your email address. Click the link in the email to sign in to your account.
            </p>
            
            <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
              <p className="font-medium">Didn&apos;t receive the email?</p>
              <ul className="text-xs text-muted-foreground space-y-1 text-left">
                <li>• Check your spam or junk folder</li>
                <li>• Make sure you entered the correct email</li>
                <li>• Wait a few minutes and check again</li>
              </ul>
            </div>

            <div className="space-y-2 pt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/auth/signin">
                  Try a different email
                </Link>
              </Button>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/">
                  Back to home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          For security, the link will expire in 24 hours
        </p>
      </div>
    </div>
  )
}
