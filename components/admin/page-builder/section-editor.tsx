"use client"

import { HeroSectionEditor } from "./sections/hero-section"
import { TextSectionEditor } from "./sections/text-section"
import { GallerySectionEditor } from "./sections/gallery-section"
import { FAQSectionEditor } from "./sections/faq-section"
import { MapSectionEditor } from "./sections/map-section"
import { RegistrySectionEditor } from "./sections/registry-section"
import { TimelineSectionEditor } from "./sections/timeline-section"
import { TwoColumnSectionEditor } from "./sections/two-column-section"

interface Section {
  id: string
  type: string
  content: any
  order: number
}

interface SectionEditorProps {
  section: Section
  onChange: (content: any) => void
}

export function SectionEditor({ section, onChange }: SectionEditorProps) {
  switch (section.type) {
    case "hero":
      return <HeroSectionEditor content={section.content} onChange={onChange} />
    case "text":
      return <TextSectionEditor content={section.content} onChange={onChange} />
    case "two-column":
      return <TwoColumnSectionEditor content={section.content} onChange={onChange} />
    case "gallery":
      return <GallerySectionEditor content={section.content} onChange={onChange} />
    case "timeline":
      return <TimelineSectionEditor content={section.content} onChange={onChange} />
    case "faq":
      return <FAQSectionEditor content={section.content} onChange={onChange} />
    case "map":
      return <MapSectionEditor content={section.content} onChange={onChange} />
    case "registry":
      return <RegistrySectionEditor content={section.content} onChange={onChange} />
    default:
      return (
        <div className="p-8 text-center text-muted-foreground">
          <p>Unknown section type: {section.type}</p>
          <p className="text-sm mt-2">Editor for this section type is not yet implemented</p>
        </div>
      )
  }
}

