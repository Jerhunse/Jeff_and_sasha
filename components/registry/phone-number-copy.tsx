"use client"

import { Button } from "@/components/ui/button"

export function PhoneNumberCopy() {
  const handleCopy = () => {
    navigator.clipboard.writeText("4049809690")
    alert("Phone number copied to clipboard!")
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
    >
      Copy
    </Button>
  )
}
