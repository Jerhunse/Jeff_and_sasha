"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, ChevronDown } from "lucide-react"

interface FAQItem {
  question: string
  answer: string
}

interface FAQSectionContent {
  items: FAQItem[]
}

interface FAQSectionEditorProps {
  content: FAQSectionContent
  onChange: (content: FAQSectionContent) => void
}

export function FAQSectionEditor({ content, onChange }: FAQSectionEditorProps) {
  const addItem = () => {
    onChange({
      ...content,
      items: [...(content.items || []), { question: "", answer: "" }],
    })
  }

  const removeItem = (index: number) => {
    onChange({
      ...content,
      items: content.items.filter((_, i) => i !== index),
    })
  }

  const updateItem = (index: number, field: "question" | "answer", value: string) => {
    const updated = [...content.items]
    updated[index] = { ...updated[index], [field]: value }
    onChange({ ...content, items: updated })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>FAQ Settings</CardTitle>
            <Button onClick={addItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.items?.map((item, index) => (
            <Card key={index}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label>Question {index + 1}</Label>
                      <Input
                        value={item.question}
                        onChange={(e) =>
                          updateItem(index, "question", e.target.value)
                        }
                        placeholder="Enter your question"
                      />
                    </div>
                    <div>
                      <Label>Answer</Label>
                      <Textarea
                        value={item.answer}
                        onChange={(e) => updateItem(index, "answer", e.target.value)}
                        placeholder="Enter the answer"
                        rows={3}
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!content.items || content.items.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              No FAQ items yet. Click "Add Question" to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {content.items?.map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between font-medium mb-2">
                  <span>{item.question || `Question ${index + 1}`}</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {item.answer || "Answer will appear here"}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

