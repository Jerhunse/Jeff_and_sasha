"use client"

import { useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Camera } from "lucide-react"

interface CameraSelectorProps {
  selectedDeviceId: string | null
  onDeviceSelect: (deviceId: string) => void
}

export function CameraSelector({
  selectedDeviceId,
  onDeviceSelect,
}: CameraSelectorProps) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDevices() {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true })
        const allDevices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = allDevices.filter(
          (device) => device.kind === "videoinput"
        )
        setDevices(videoDevices)

        if (videoDevices.length > 0 && !selectedDeviceId) {
          onDeviceSelect(videoDevices[0].deviceId)
        }
      } catch (error) {
        console.error("Error loading camera devices:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDevices()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-5 py-2 rounded-full border border-[var(--pb-champagne)]/20 bg-[var(--pb-soft-cream)] text-[var(--pb-forest-green)]">
        <Camera className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">
          Loading...
        </span>
      </div>
    )
  }

  if (devices.length === 0) {
    return (
      <div className="flex items-center gap-2 px-5 py-2 rounded-full border border-red-500/20 bg-red-50 text-red-700">
        <Camera className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">
          No Camera Found
        </span>
      </div>
    )
  }

  return (
    <Select value={selectedDeviceId || undefined} onValueChange={onDeviceSelect}>
      <SelectTrigger className="flex items-center gap-2 px-5 py-2 rounded-full border border-[var(--pb-champagne)]/20 bg-[var(--pb-soft-cream)] text-[var(--pb-forest-green)] hover:bg-[var(--pb-champagne)] transition-all text-xs font-bold uppercase tracking-wider w-auto">
        <Camera className="w-4 h-4" />
        <SelectValue placeholder="Select Camera" />
      </SelectTrigger>
      <SelectContent>
        {devices.map((device) => (
          <SelectItem key={device.deviceId} value={device.deviceId}>
            {device.label || `Camera ${devices.indexOf(device) + 1}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
