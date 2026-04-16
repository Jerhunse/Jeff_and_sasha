import chokidar, { type FSWatcher } from "chokidar"
import path from "path"
import fs from "fs/promises"

const WATCH_DIR = process.env.PHOTOBOOTH_WATCH_DIR || "/Users/jefferyerhunse/Pictures"
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".arw", ".png", ".tif", ".tiff"])

type CaptureResolver = {
  resolve: (file: { path: string; buffer: Buffer }) => void
  reject: (error: Error) => void
  timeout: NodeJS.Timeout
}

interface TetheredCameraState {
  watcher: FSWatcher | null
  pendingCapture: CaptureResolver | null
  initialized: boolean
}

const globalForTethered = globalThis as typeof globalThis & {
  __tetheredCamera?: TetheredCameraState
}

if (!globalForTethered.__tetheredCamera) {
  globalForTethered.__tetheredCamera = {
    watcher: null,
    pendingCapture: null,
    initialized: false,
  }
}

const state = globalForTethered.__tetheredCamera

function isImageFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase()
  return IMAGE_EXTENSIONS.has(ext)
}

async function waitForFileStable(filePath: string, maxAttempts = 40): Promise<void> {
  let lastSize = -1
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const stats = await fs.stat(filePath)
      if (stats.size > 0 && stats.size === lastSize) {
        return
      }
      lastSize = stats.size
    } catch {
      // File might not be fully written yet
    }
    await new Promise((r) => setTimeout(r, 250))
  }
}

function initWatcher() {
  if (state.initialized) return
  state.initialized = true

  console.log(`[Tethered Camera] Watching directory: ${WATCH_DIR}`)

  state.watcher = chokidar.watch(WATCH_DIR, {
    ignoreInitial: true,
    depth: 0,
    ignored: [
      /\.photoslibrary/,
      /Photo Booth Library/,
      /\.DS_Store/,
      /Lightroom/,
    ],
  })

  state.watcher.on("add", async (filePath: string) => {
    console.log(`[Tethered Camera] File event: ${filePath}`)

    if (!isImageFile(filePath)) {
      console.log(`[Tethered Camera] Skipping non-image: ${filePath}`)
      return
    }

    console.log(`[Tethered Camera] New image detected: ${filePath}`)

    if (!state.pendingCapture) {
      console.log(`[Tethered Camera] No pending capture, ignoring file`)
      return
    }

    try {
      await waitForFileStable(filePath)
      const buffer = await fs.readFile(filePath)
      console.log(`[Tethered Camera] File read successfully: ${buffer.length} bytes`)

      const capture = state.pendingCapture
      state.pendingCapture = null
      clearTimeout(capture.timeout)
      capture.resolve({ path: filePath, buffer })
    } catch (error) {
      console.error(`[Tethered Camera] Error reading file:`, error)
      const capture = state.pendingCapture
      if (capture) {
        state.pendingCapture = null
        clearTimeout(capture.timeout)
        capture.reject(new Error("Failed to read captured file"))
      }
    }
  })

  state.watcher.on("error", (error: unknown) => {
    console.error("[Tethered Camera] Watcher error:", error)
  })

  state.watcher.on("ready", () => {
    console.log("[Tethered Camera] Watcher ready and listening")
  })
}

/**
 * Wait for the next image file to appear in the watch directory.
 * Returns the file buffer once the image is fully written.
 */
export function waitForNextCapture(timeoutMs = 30000): Promise<{ path: string; buffer: Buffer }> {
  initWatcher()

  if (state.pendingCapture) {
    state.pendingCapture.reject(new Error("Superseded by new capture request"))
    clearTimeout(state.pendingCapture.timeout)
    state.pendingCapture = null
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      if (state.pendingCapture) {
        state.pendingCapture = null
        reject(new Error("Tethered capture timed out - no new image detected"))
      }
    }, timeoutMs)

    state.pendingCapture = { resolve, reject, timeout }
  })
}

export function isTetheredModeAvailable(): boolean {
  return !!process.env.PHOTOBOOTH_WATCH_DIR
}

export function getWatchDir(): string {
  return WATCH_DIR
}
