"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Plus, Upload, Download, Tag as TagIcon, Users, FileSpreadsheet, Key } from "lucide-react"
import { Tag } from "@prisma/client"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface GuestActionsProps {
  weddingId: string
  tags: Tag[]
}

export function GuestActions({ weddingId, tags }: GuestActionsProps) {
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [generatingCodes, setGeneratingCodes] = useState(false)
  const [exporting, setExporting] = useState(false)
  const router = useRouter()

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const response = await fetch(`/api/admin/guests/export?format=csv&coupleId=${weddingId}`)
      if (!response.ok) throw new Error("Export failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `guest-list-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (error) {
      console.error("Export error:", error)
      alert("Failed to export guests. Please try again.")
    } finally {
      setExporting(false)
    }
  }

  const handleExportRSVP = async () => {
    setExporting(true)
    try {
      const response = await fetch(`/api/admin/guests/export?format=rsvp&coupleId=${weddingId}`)
      if (!response.ok) throw new Error("Export failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `rsvp-summary-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (error) {
      console.error("Export error:", error)
      alert("Failed to export RSVP summary. Please try again.")
    } finally {
      setExporting(false)
    }
  }

  const handleGenerateInviteCodes = async () => {
    if (
      !confirm(
        "Generate invite codes for all guests without codes? This will allow them to access the RSVP form."
      )
    ) return

    setGeneratingCodes(true)
    try {
      const response = await fetch("/api/admin/guests/generate-invite-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      })

      const data = await response.json()

      if (data.success) {
        alert(
          `Successfully generated ${data.summary.success} invite code(s).${data.summary.failed > 0 ? ` ${data.summary.failed} failed.` : ""}`
        )
        router.refresh()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("Error generating invite codes:", error)
      alert("Failed to generate invite codes. Please try again.")
    } finally {
      setGeneratingCodes(false)
    }
  }

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild>
          <Link href="/admin/guests/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Guest
          </Link>
        </Button>

        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Import Guests</DialogTitle>
              <DialogDescription>
                Choose how you&apos;d like to import your guests
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/admin/guests/import/csv" onClick={() => setImportDialogOpen(false)}>
                <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <FileSpreadsheet className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">CSV File</h3>
                      <p className="text-sm text-muted-foreground">
                        Import from an Excel or CSV file
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link href="/admin/guests/import/google" onClick={() => setImportDialogOpen(false)}>
                <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Google Contacts</h3>
                      <p className="text-sm text-muted-foreground">
                        Connect your Google account
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>

            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Tip:</strong> Our smart dedupe system will automatically detect and
                help you merge duplicate guests during import.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={exporting}>
              <Download className="h-4 w-4 mr-2" />
              {exporting ? "Exporting..." : "Export"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Export Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExportCSV}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export to CSV
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExportRSVP}>
              Export RSVP Summary
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="hidden sm:block w-px h-6 bg-border mx-1" />

        <Button variant="outline" asChild>
          <Link href="/admin/guests/tags">
            <TagIcon className="h-4 w-4 mr-2" />
            Manage Tags ({tags.length})
          </Link>
        </Button>

        <Button
          variant="outline"
          onClick={handleGenerateInviteCodes}
          disabled={generatingCodes}
        >
          <Key className="h-4 w-4 mr-2" />
          {generatingCodes ? "Generating..." : "Generate Codes"}
        </Button>
      </div>
    </Card>
  )
}

