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

const PREFERRED_CAMERA_PATTERNS = [
  /sony/i,
  /imaging edge/i,
  /usb video/i,
  /mirrorless/i,
  /dslr/i,
  /external/i,
]

const DEPRIORITIZED_CAMERA_PATTERNS = [
  /integrated/i,
  /built-?in/i,
  /facetime/i,
  /internal/i,
]

function scoreDevice(device: MediaDeviceInfo): number {
  const label = device.label || ""
  if (!label) return 0

  let score = 0
  for (const pattern of PREFERRED_CAMERA_PATTERNS) {
    if (pattern.test(label)) score += 5
  }
  for (const pattern of DEPRIORITIZED_CAMERA_PATTERNS) {
    if (pattern.test(label)) score -= 3
  }
  return score
}

function pickPreferredDevice(devices: MediaDeviceInfo[]): MediaDeviceInfo | null {
  if (devices.length === 0) return null
  const ranked = [...devices].sort((a, b) => scoreDevice(b) - scoreDevice(a))
  return ranked[0] || null
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

        const currentDeviceStillExists = selectedDeviceId
          ? videoDevices.some((device) => device.deviceId === selectedDeviceId)
          : false

        if (!currentDeviceStillExists) {
          const preferred = pickPreferredDevice(videoDevices)
          if (preferred) {
            onDeviceSelect(preferred.deviceId)
          }
        }
      } catch (error) {
        console.error("Error loading camera devices:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDevices()

    const handleDeviceChange = () => {
      loadDevices()
    }

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange)

    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", handleDeviceChange)
    }
  }, [selectedDeviceId, onDeviceSelect])

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
