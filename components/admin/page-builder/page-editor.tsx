"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save, Eye, Plus, GripVertical, Trash2 } from "lucide-react"
import { SectionLibrary } from "./section-library"
import { SectionEditor } from "./section-editor"

interface Section {
  id: string
  type: string
  content: any
  order: number
}

interface PageEditorProps {
  pageId?: string
  initialData?: {
    title: string
    slug: string
    type: string
    contentJSON: string
    isPublished: boolean
  }
}

export function PageEditor({ pageId, initialData }: PageEditorProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState(initialData?.title || "")
  const [slug, setSlug] = useState(initialData?.slug || "")
  const [pageType, setPageType] = useState(initialData?.type || "CUSTOM")
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? true)
  const [sections, setSections] = useState<Section[]>([])
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [showLibrary, setShowLibrary] = useState(false)

  // Load initial content
  useEffect(() => {
    if (initialData?.contentJSON) {
      try {
        const content = JSON.parse(initialData.contentJSON)
        setSections(content.sections || [])
      } catch (e) {
        console.error("Failed to parse content JSON", e)
      }
    }
  }, [initialData])

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!pageId) {
      // Only auto-generate slug for new pages
      const autoSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
      setSlug(autoSlug)
    }
  }

  const addSection = (type: string) => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      type,
      content: getDefaultContentForType(type),
      order: sections.length,
    }
    setSections([...sections, newSection])
    setSelectedSectionId(newSection.id)
    setShowLibrary(false)
  }

  const updateSection = (sectionId: string, content: any) => {
    setSections(
      sections.map((s) => (s.id === sectionId ? { ...s, content } : s))
    )
  }

  const deleteSection = (sectionId: string) => {
    setSections(sections.filter((s) => s.id !== sectionId))
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null)
    }
  }

  const moveSection = (sectionId: string, direction: "up" | "down") => {
    const index = sections.findIndex((s) => s.id === sectionId)
    if (index === -1) return

    if (direction === "up" && index > 0) {
      const newSections = [...sections]
      ;[newSections[index - 1], newSections[index]] = [
        newSections[index],
        newSections[index - 1],
      ]
      setSections(newSections.map((s, i) => ({ ...s, order: i })))
    } else if (direction === "down" && index < sections.length - 1) {
      const newSections = [...sections]
      ;[newSections[index], newSections[index + 1]] = [
        newSections[index + 1],
        newSections[index],
      ]
      setSections(newSections.map((s, i) => ({ ...s, order: i })))
    }
  }

  const handleSave = async (publish = false) => {
    setIsSaving(true)
    setError(null)

    if (!title) {
      setError("Page title is required")
      setIsSaving(false)
      return
    }

    if (!slug) {
      setError("Page slug is required")
      setIsSaving(false)
      return
    }

    try {
      const contentJSON = { sections }

      const url = pageId ? `/api/admin/pages/${pageId}` : "/api/admin/pages"
      const method = pageId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          type: pageType,
          contentJSON,
          isPublished: publish ? true : isPublished,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save page")
      }

      const data = await response.json()

      // Redirect to pages list
      router.push("/admin/pages")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const selectedSection = sections.find((s) => s.id === selectedSectionId)

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex-1 max-w-md space-y-2">
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Page Title"
              className="text-lg font-semibold"
            />
            <div className="flex gap-2">
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="page-slug"
                className="text-sm"
              />
              <Select value={pageType} onValueChange={setPageType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOME">Home</SelectItem>
                  <SelectItem value="SCHEDULE">Schedule</SelectItem>
                  <SelectItem value="TRAVEL">Travel</SelectItem>
                  <SelectItem value="REGISTRY">Registry</SelectItem>
                  <SelectItem value="FAQ">FAQ</SelectItem>
                  <SelectItem value="CONTACT">Contact</SelectItem>
                  <SelectItem value="CUSTOM">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/pages")}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span className="ml-2">Save Draft</span>
            </Button>
            <Button onClick={() => handleSave(true)} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="ml-2">Publish</span>
            </Button>
          </div>
        </div>

        {error && (
          <div className="max-w-7xl mx-auto mt-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-800 dark:text-red-200 text-sm">
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Section List */}
        <div className="w-64 border-r bg-muted/30 overflow-y-auto">
          <div className="p-4">
            <Button
              onClick={() => setShowLibrary(true)}
              className="w-full"
              variant="default"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Section
            </Button>
          </div>

          <div className="space-y-1 px-2">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedSectionId === section.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
                onClick={() => setSelectedSectionId(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 opacity-50" />
                    <span className="text-sm font-medium">
                      {getSectionDisplayName(section.type)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteSection(section.id)
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex gap-1 mt-2">
                  {index > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        moveSection(section.id, "up")
                      }}
                      className="h-6 text-xs"
                    >
                      ↑
                    </Button>
                  )}
                  {index < sections.length - 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        moveSection(section.id, "down")
                      }}
                      className="h-6 text-xs"
                    >
                      ↓
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {sections.length === 0 && (
              <div className="text-center p-8 text-muted-foreground text-sm">
                No sections yet. Add your first section to get started.
              </div>
            )}
          </div>
        </div>

        {/* Center - Editor/Preview */}
        <div className="flex-1 overflow-y-auto">
          {selectedSection ? (
            <div className="p-6 max-w-4xl mx-auto">
              <SectionEditor
                section={selectedSection}
                onChange={(content) => updateSection(selectedSection.id, content)}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No section selected</p>
                <p className="text-sm">
                  Select a section from the left or add a new one
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section Library Modal */}
      {showLibrary && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <SectionLibrary
              onSelectSection={addSection}
              onClose={() => setShowLibrary(false)}
            />
          </Card>
        </div>
      )}
    </div>
  )
}

function getDefaultContentForType(type: string): any {
  switch (type) {
    case "hero":
      return {
        title: "Welcome to Our Wedding",
        subtitle: "Join us as we celebrate",
        backgroundImage: "",
        showCountdown: true,
      }
    case "text":
      return {
        content: "Add your content here...",
        alignment: "left",
      }
    case "faq":
      return {
        items: [
          { question: "Question 1", answer: "Answer 1" },
        ],
      }
    case "map":
      return {
        location: "",
        zoom: 15,
        showDirections: true,
      }
    case "registry":
      return {
        items: [],
        showCashFund: true,
      }
    case "timeline":
      return {
        events: [],
      }
    case "two-column":
      return {
        leftContent: "",
        rightContent: "",
        imagePosition: "right",
      }
    default:
      return {}
  }
}

function getSectionDisplayName(type: string): string {
  const names: Record<string, string> = {
    hero: "Hero",
    text: "Text Block",
    faq: "FAQ",
    map: "Map",
    registry: "Registry",
    timeline: "Timeline",
    "two-column": "Two Column",
  }
  return names[type] || type
}

