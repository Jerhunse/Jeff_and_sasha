"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  Home,
  Users,
} from "lucide-react"
import Link from "next/link"

interface HouseholdData {
  id: string
  name: string
  maxGuests: number | null
  notes: string | null
  _count?: { guests: number }
  guests?: Array<{ id: string; firstName: string; lastName: string }>
}

export default function ManageHouseholdsPage() {
  const router = useRouter()
  const [households, setHouseholds] = useState<HouseholdData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingHousehold, setEditingHousehold] = useState<HouseholdData | null>(null)
  const [form, setForm] = useState({ name: "", maxGuests: "", notes: "" })

  const fetchHouseholds = async () => {
    try {
      const response = await fetch("/api/admin/households")
      if (!response.ok) throw new Error("Failed to fetch households")
      const data = await response.json()
      setHouseholds(data.households)
    } catch (err) {
      setError("Failed to load households")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHouseholds()
  }, [])

  const openCreateDialog = () => {
    setEditingHousehold(null)
    setForm({ name: "", maxGuests: "", notes: "" })
    setDialogOpen(true)
  }

  const openEditDialog = (household: HouseholdData) => {
    setEditingHousehold(household)
    setForm({
      name: household.name,
      maxGuests: household.maxGuests?.toString() || "",
      notes: household.notes || "",
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return

    setSaving(true)
    setError(null)
    try {
      const url = editingHousehold
        ? `/api/admin/households?id=${editingHousehold.id}`
        : "/api/admin/households"
      const method = editingHousehold ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          maxGuests: form.maxGuests ? parseInt(form.maxGuests) : null,
          notes: form.notes || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save household")
      }

      setDialogOpen(false)
      fetchHouseholds()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (householdId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this household? Guests will be unlinked but not deleted."
      )
    )
      return

    try {
      const response = await fetch(`/api/admin/households?id=${householdId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete household")
      fetchHouseholds()
    } catch (err) {
      setError("Failed to delete household")
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/guests">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Guests
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl font-bold mb-2">Manage Households</h1>
          <p className="text-muted-foreground">
            Group guests by household for shared invitations and RSVP tracking
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          New Household
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : households.length === 0 ? (
          <div className="text-center py-12">
            <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No households yet</h3>
            <p className="text-muted-foreground mb-4">
              Create households to group related guests together
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Household
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Household</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Max Guests</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {households.map((household) => (
                <TableRow key={household.id}>
                  <TableCell className="font-medium">{household.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      {household._count?.guests ?? 0}
                    </div>
                    {household.guests && household.guests.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {household.guests.map((g) => (
                          <Badge key={g.id} variant="secondary" className="text-xs">
                            {g.firstName} {g.lastName}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {household.maxGuests || "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {household.notes || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(household)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(household.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingHousehold ? "Edit Household" : "Create Household"}
            </DialogTitle>
            <DialogDescription>
              {editingHousehold
                ? "Update the household details"
                : "Create a new household to group guests together"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="householdName">Household Name *</Label>
              <Input
                id="householdName"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder='e.g., "The Smith Family", "Johnson Household"'
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxGuests">Max Guests Allowed</Label>
              <Input
                id="maxGuests"
                type="number"
                min={1}
                value={form.maxGuests}
                onChange={(e) => setForm((f) => ({ ...f, maxGuests: e.target.value }))}
                placeholder="Leave empty for no limit"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="householdNotes">Notes</Label>
              <Textarea
                id="householdNotes"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Any notes about this household..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !form.name.trim()}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {editingHousehold ? "Save Changes" : "Create Household"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
