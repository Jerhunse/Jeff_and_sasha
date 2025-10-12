"use client"

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
import { Plus, Upload, Download, Tag as TagIcon, Users, FileSpreadsheet } from "lucide-react"
import { Tag, Household } from "@prisma/client"
import { useState } from "react"
import Link from "next/link"

interface GuestActionsProps {
  weddingId: string
  tags: Tag[]
  households: Household[]
}

export function GuestActions({ weddingId, tags, households }: GuestActionsProps) {
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
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
                  Choose how you'd like to import your guests
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/admin/guests/import/csv">
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

                <Link href="/admin/guests/import/google">
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
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Export Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export to CSV
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export to Excel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Export RSVP Summary
              </DropdownMenuItem>
              <DropdownMenuItem>
                Export Mailing Labels
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/guests/tags">
              <TagIcon className="h-4 w-4 mr-2" />
              Manage Tags ({tags.length})
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href="/admin/guests/households">
              <Users className="h-4 w-4 mr-2" />
              Manage Households ({households.length})
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}

