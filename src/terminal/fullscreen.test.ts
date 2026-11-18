import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { toggleFullscreen } from './fullscreen'

describe('optional fullscreen', () => {
  const requestFullscreen = vi.fn(async () => {})
  const exitFullscreen = vi.fn(async () => {})
  let browser: {
    documentElement: { requestFullscreen?: typeof requestFullscreen }
    exitFullscreen?: typeof exitFullscreen
    fullscreenElement: object | null
    fullscreenEnabled: boolean
  }

  beforeEach(() => {
    browser = {
      documentElement: { requestFullscreen },
      exitFullscreen,
      fullscreenElement: null,
      fullscreenEnabled: true,
    }
    vi.stubGlobal('document', browser)
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetAllMocks()
  })

  it('requests fullscreen immediately, before awaiting or animating anything', async () => {
    const result = toggleFullscreen()
    expect(requestFullscreen).toHaveBeenCalledOnce()
    expect(exitFullscreen).not.toHaveBeenCalled()
    expect(await result).toBe('changed')
  })

  it('exits when already fullscreen and respects the browser state after native Escape', async () => {
    browser.fullscreenElement = browser.documentElement
    expect(await toggleFullscreen()).toBe('changed')
    expect(exitFullscreen).toHaveBeenCalledOnce()
    expect(requestFullscreen).not.toHaveBeenCalled()
    browser.fullscreenElement = null // Browser-owned state, e.g. Escape.
    expect(await toggleFullscreen()).toBe('changed')
    expect(requestFullscreen).toHaveBeenCalledOnce()
  })

  it('gracefully handles an unavailable API', async () => {
    delete browser.documentElement.requestFullscreen
    expect(await toggleFullscreen()).toBe('unsupported')
    expect(requestFullscreen).not.toHaveBeenCalled()
  })

  it('gracefully handles fullscreen disabled by the browser or embedding policy', async () => {
    browser.fullscreenEnabled = false
    expect(await toggleFullscreen()).toBe('unsupported')
    expect(requestFullscreen).not.toHaveBeenCalled()
  })

  it('handles rejected promises without throwing', async () => {
    requestFullscreen.mockRejectedValueOnce(new Error('Permission denied'))
    expect(await toggleFullscreen()).toBe('denied')
  })

  it('handles synchronous API errors', async () => {
    requestFullscreen.mockImplementationOnce(() => { throw new Error('Not permitted') })
    expect(await toggleFullscreen()).toBe('denied')
  })

  it('handles an unsuccessful exit', async () => {
    browser.fullscreenElement = browser.documentElement
    exitFullscreen.mockRejectedValueOnce(new Error('Exit failed'))
    expect(await toggleFullscreen()).toBe('denied')
  })
})
