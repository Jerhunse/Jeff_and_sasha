import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Users, Info } from "lucide-react"
import Link from "next/link"

export default function GoogleContactsImportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/guests">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Guests
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="font-serif text-4xl font-bold mb-2">Import from Google Contacts</h1>
        <p className="text-muted-foreground">
          Connect your Google account to import contacts directly
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Coming Soon!</strong> Google Contacts integration is currently in development.
          Use CSV import for now.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Google Contacts Integration</CardTitle>
          <CardDescription>
            Import guests directly from your Google Contacts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-6 rounded-full bg-muted mb-6">
              <Users className="h-12 w-12 text-muted-foreground" />
            </div>
            
            <h3 className="font-semibold text-lg mb-2">
              Google OAuth Integration Required
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
              To enable Google Contacts import, you'll need to configure Google OAuth credentials
              and implement the Google People API integration.
            </p>

            <div className="flex gap-2">
              <Button disabled>
                Connect Google Account
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/guests/import/csv">
                  Use CSV Import Instead
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t">
            <h4 className="font-semibold">Implementation Steps:</h4>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Set up Google Cloud Project and OAuth credentials</li>
              <li>Enable Google People API</li>
              <li>Implement OAuth flow with NextAuth</li>
              <li>Fetch contacts using Google People API</li>
              <li>Map contact fields to guest model</li>
              <li>Show duplicate detection and merge options</li>
            </ol>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Alternative:</strong> Export your Google Contacts as CSV and use the
              CSV import feature which is fully functional.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

