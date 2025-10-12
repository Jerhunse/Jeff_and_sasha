"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gift } from "lucide-react"

interface RegistrySectionContent {
  items: any[] // Will be populated from database
  showCashFund: boolean
}

interface RegistrySectionEditorProps {
  content: RegistrySectionContent
  onChange: (content: RegistrySectionContent) => void
}

export function RegistrySectionEditor({
  content,
  onChange,
}: RegistrySectionEditorProps) {
  const updateField = (field: keyof RegistrySectionContent, value: any) => {
    onChange({ ...content, [field]: value })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Registry Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="registry-cashfund"
              checked={content.showCashFund || false}
              onCheckedChange={(checked) => updateField("showCashFund", checked)}
            />
            <Label htmlFor="registry-cashfund" className="cursor-pointer">
              Display cash fund options
            </Label>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Registry items and cash funds are managed in the Registry section
              of your admin panel. This section will automatically display your
              configured registries.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 text-center">
                <Gift className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="font-medium">Registry Store</p>
                <p className="text-sm text-muted-foreground">View our registry</p>
              </div>
              {content.showCashFund && (
                <div className="border rounded-lg p-4 text-center bg-primary/5">
                  <Gift className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">Cash Fund</p>
                  <p className="text-sm text-muted-foreground">
                    Contribute to our future
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

