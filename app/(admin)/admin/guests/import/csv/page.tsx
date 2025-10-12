"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  FileSpreadsheet,
  Upload,
  CheckCircle,
  AlertCircle,
  Download,
  ArrowLeft,
  Users,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"

interface ParsedGuest {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  addressLine1?: string
  city?: string
  state?: string
  zipCode?: string
  isDuplicate?: boolean
  duplicateOf?: string
}

export default function CSVImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedGuest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<"upload" | "review" | "complete">("upload")
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setError(null)

    // Validate file type
    if (!selectedFile.name.endsWith(".csv")) {
      setError("Please select a valid CSV file")
      return
    }

    // Parse CSV
    setLoading(true)
    try {
      const text = await selectedFile.text()
      const parsed = parseCSV(text)
      
      // Detect duplicates (simplified - in production, check against database)
      const withDuplicates = detectDuplicates(parsed)
      
      setParsedData(withDuplicates)
      setSelectedRows(new Set(withDuplicates.map((_, i) => i)))
      setStep("review")
    } catch (err) {
      setError("Error parsing CSV file. Please check the format.")
    } finally {
      setLoading(false)
    }
  }

  const parseCSV = (text: string): ParsedGuest[] => {
    const lines = text.split("\n")
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase())
    
    return lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(",")
        const guest: any = {}
        
        headers.forEach((header, index) => {
          const value = values[index]?.trim()
          
          // Map common header names
          if (header.includes("first")) guest.firstName = value
          else if (header.includes("last")) guest.lastName = value
          else if (header.includes("email")) guest.email = value
          else if (header.includes("phone")) guest.phone = value
          else if (header.includes("address")) guest.addressLine1 = value
          else if (header.includes("city")) guest.city = value
          else if (header.includes("state")) guest.state = value
          else if (header.includes("zip")) guest.zipCode = value
        })
        
        return guest as ParsedGuest
      })
      .filter(guest => guest.firstName && guest.lastName)
  }

  const detectDuplicates = (guests: ParsedGuest[]): ParsedGuest[] => {
    const seen = new Map<string, number>()
    
    return guests.map((guest, index) => {
      const key = `${guest.firstName.toLowerCase()}_${guest.lastName.toLowerCase()}_${guest.email?.toLowerCase() || ""}`
      
      if (seen.has(key)) {
        return {
          ...guest,
          isDuplicate: true,
          duplicateOf: `Row ${seen.get(key)! + 1}`,
        }
      }
      
      seen.set(key, index)
      return guest
    })
  }

  const toggleRow = (index: number) => {
    const newSelection = new Set(selectedRows)
    if (newSelection.has(index)) {
      newSelection.delete(index)
    } else {
      newSelection.add(index)
    }
    setSelectedRows(newSelection)
  }

  const toggleAll = () => {
    if (selectedRows.size === parsedData.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(parsedData.map((_, i) => i)))
    }
  }

  const handleImport = async () => {
    setLoading(true)
    try {
      const guestsToImport = parsedData.filter((_, index) => selectedRows.has(index))
      
      const response = await fetch("/api/admin/guests/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guests: guestsToImport }),
      })

      if (!response.ok) throw new Error("Import failed")

      setStep("complete")
    } catch (err) {
      setError("Failed to import guests. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const duplicateCount = parsedData.filter(g => g.isDuplicate).length
  const selectedCount = selectedRows.size

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
        <h1 className="font-serif text-4xl font-bold mb-2">Import from CSV</h1>
        <p className="text-muted-foreground">
          Upload a CSV file to bulk import your guest list
        </p>
      </div>

      {/* Upload Step */}
      {step === "upload" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
              <CardDescription>
                Select a CSV file containing your guest information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-primary/10">
                    <FileSpreadsheet className="h-8 w-8 text-primary" />
                  </div>
                  
                  <div>
                    <Label htmlFor="csv-upload" className="cursor-pointer">
                      <div className="text-sm font-medium mb-1">
                        Click to upload or drag and drop
                      </div>
                      <div className="text-xs text-muted-foreground">
                        CSV files only (max 10MB)
                      </div>
                    </Label>
                    <Input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  {file && (
                    <Badge variant="secondary">
                      {file.name}
                    </Badge>
                  )}

                  <Button asChild variant="outline" size="sm">
                    <label htmlFor="csv-upload" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Select File
                    </label>
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {loading && (
                <Alert>
                  <Upload className="h-4 w-4 animate-spin" />
                  <AlertDescription>Processing CSV file...</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CSV Format</CardTitle>
              <CardDescription>Required and optional columns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Required Columns:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• First Name</li>
                  <li>• Last Name</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Optional Columns:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Email</li>
                  <li>• Phone</li>
                  <li>• Address</li>
                  <li>• City</li>
                  <li>• State</li>
                  <li>• ZIP Code</li>
                </ul>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Review Step */}
      {step === "review" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Review Import Data</CardTitle>
                  <CardDescription>
                    {parsedData.length} guests found • {selectedCount} selected
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep("upload")}>
                    Cancel
                  </Button>
                  <Button onClick={handleImport} disabled={loading || selectedCount === 0}>
                    {loading ? (
                      <>
                        <Upload className="h-4 w-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Import {selectedCount} Guests
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {duplicateCount > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{duplicateCount} potential duplicates detected.</strong> Review the highlighted
                rows below. You can deselect duplicates before importing.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <div className="relative w-full overflow-auto max-h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedRows.size === parsedData.length}
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.map((guest, index) => (
                    <TableRow
                      key={index}
                      className={guest.isDuplicate ? "bg-yellow-50" : ""}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.has(index)}
                          onCheckedChange={() => toggleRow(index)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {guest.firstName} {guest.lastName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{guest.email || "-"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{guest.phone || "-"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {guest.city && guest.state
                            ? `${guest.city}, ${guest.state}`
                            : "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {guest.isDuplicate && (
                          <Badge variant="secondary" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Possible Duplicate
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* Complete Step */}
      {step === "complete" && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
              <div className="p-4 rounded-full bg-green-100">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              
              <div>
                <h2 className="font-serif text-3xl font-bold mb-2">Import Complete!</h2>
                <p className="text-muted-foreground">
                  Successfully imported {selectedCount} guests to your wedding
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                <Button asChild>
                  <Link href="/admin/guests">
                    <Users className="h-4 w-4 mr-2" />
                    View Guest List
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => {
                  setStep("upload")
                  setFile(null)
                  setParsedData([])
                  setSelectedRows(new Set())
                }}>
                  Import More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

