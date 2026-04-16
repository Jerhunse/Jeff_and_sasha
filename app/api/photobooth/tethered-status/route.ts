import { NextResponse } from "next/server"
import { isTetheredModeAvailable, getWatchDir } from "@/lib/tethered-camera"

export async function GET() {
  return NextResponse.json({
    available: isTetheredModeAvailable(),
    watchDir: isTetheredModeAvailable() ? getWatchDir() : null,
  })
}
