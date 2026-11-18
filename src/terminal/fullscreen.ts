export type FullscreenResult = 'changed' | 'unsupported' | 'denied'

/** Call directly from the Enter handler, before timers consume browser user activation. */
export async function toggleFullscreen(): Promise<FullscreenResult> {
  try {
    if (document.fullscreenElement) {
      if (typeof document.exitFullscreen !== 'function') return 'unsupported'
      await document.exitFullscreen()
    } else {
      if (document.fullscreenEnabled === false || typeof document.documentElement.requestFullscreen !== 'function') {
        return 'unsupported'
      }
      // The document root preserves window scrolling and the existing terminal layout.
      await document.documentElement.requestFullscreen()
    }
    return 'changed'
  } catch {
    return 'denied'
  }
}
