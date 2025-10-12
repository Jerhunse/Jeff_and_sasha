"use client"

import { Button } from "@/components/ui/button"
import { X, Type, Image, HelpCircle, Map, Gift, Clock, Columns } from "lucide-react"

interface SectionLibraryProps {
  onSelectSection: (type: string) => void
  onClose: () => void
}

const sectionTypes = [
  {
    type: "hero",
    name: "Hero Section",
    description: "Large banner with title, subtitle, and background image",
    icon: Image,
  },
  {
    type: "text",
    name: "Text Block",
    description: "Rich text content with formatting options",
    icon: Type,
  },
  {
    type: "two-column",
    name: "Two Column",
    description: "Side-by-side layout with text and image",
    icon: Columns,
  },
  {
    type: "gallery",
    name: "Gallery",
    description: "Grid of images with lightbox",
    icon: Image,
  },
  {
    type: "timeline",
    name: "Timeline",
    description: "Chronological events display",
    icon: Clock,
  },
  {
    type: "faq",
    name: "FAQ Accordion",
    description: "Frequently asked questions with collapsible answers",
    icon: HelpCircle,
  },
  {
    type: "map",
    name: "Map",
    description: "Embedded map with location and directions",
    icon: Map,
  },
  {
    type: "registry",
    name: "Registry Showcase",
    description: "Display registry links and cash funds",
    icon: Gift,
  },
]

export function SectionLibrary({ onSelectSection, onClose }: SectionLibraryProps) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Add Section</h2>
          <p className="text-muted-foreground">
            Choose a section type to add to your page
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sectionTypes.map((section) => {
          const Icon = section.icon
          return (
            <button
              key={section.type}
              onClick={() => onSelectSection(section.type)}
              className="p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{section.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

