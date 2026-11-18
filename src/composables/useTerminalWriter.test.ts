import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTerminalWriter, type TerminalWriter } from './useTerminalWriter'

describe('animated terminal writer compatibility', () => {
  let writer: TerminalWriter

  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    writer = useTerminalWriter()
  })
  afterEach(() => {
    writer.dispose()
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('types one character every 30ms, commits the last character and then pauses', async () => {
    const finished = vi.fn()
    const task = writer.write('ABC', 100).then(finished)
    expect(writer.writeText.value).toBe('')
    await vi.advanceTimersByTimeAsync(29)
    expect(writer.writeText.value).toBe('')
    await vi.advanceTimersByTimeAsync(1)
    expect(writer.writeText.value).toBe('A')
    await vi.advanceTimersByTimeAsync(30)
    expect(writer.writeText.value).toBe('AB')
    expect(writer.output.value).toEqual([])
    await vi.advanceTimersByTimeAsync(30)
    expect(writer.output.value).toEqual(['ABC'])
    expect(writer.writeText.value).toBeNull()
    expect(window.scrollTo).toHaveBeenCalledWith(0, document.body.scrollHeight)
    await vi.advanceTimersByTimeAsync(99)
    expect(finished).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    await task
    expect(finished).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('keeps the 30ms tick for an empty line even with no pause', async () => {
    const task = writer.write('', 0)
    await vi.advanceTimersByTimeAsync(29)
    expect(writer.output.value).toEqual([])
    await vi.runAllTimersAsync()
    await task
    expect(writer.output.value).toEqual([''])
  })

  it('updates progress in place immediately, without a typing interval', async () => {
    writer.output.value = ['HEADER', '0% CONCLUÍDO']
    const task = writer.write('1% CONCLUÍDO', 10, true)
    expect(writer.output.value).toEqual(['HEADER', '1% CONCLUÍDO'])
    expect(writer.writeText.value).toBeNull()
    expect(vi.getTimerCount()).toBe(1)
    await vi.advanceTimersByTimeAsync(10)
    await task
  })

  it('uses the same random pause range and skips random calls for explicit pauses', async () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(.5)
    const finished = vi.fn()
    const task = writer.write('A').then(finished)
    expect(random).toHaveBeenCalledOnce()
    await vi.advanceTimersByTimeAsync(579)
    expect(finished).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    await task // 30ms typing + 550ms random pause.
    const explicit = writer.write('B', 0)
    expect(random).toHaveBeenCalledOnce()
    await vi.runAllTimersAsync()
    await explicit
  })

  it.each(['typing', 'pause'] as const)('cancels during %s without leaving timers or output mutations', async (phase) => {
    const task = writer.write('AB', 1000)
    // Attach the rejection handler before aborting.
    const rejected = expect(task).rejects.toMatchObject({ name: 'AbortError' })
    await vi.advanceTimersByTimeAsync(phase === 'typing' ? 30 : 60)
    const output = [...writer.output.value]
    writer.dispose()
    await rejected
    expect(vi.getTimerCount()).toBe(0)
    await vi.runAllTimersAsync()
    expect(writer.output.value).toEqual(output)
    await expect(writer.write('AFTER DISPOSE', 0)).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('clears output synchronously without changing the text currently being typed', async () => {
    writer.output.value = ['OLD']
    const task = writer.write('AB', 0)
    await vi.advanceTimersByTimeAsync(30)
    writer.clear()
    expect(writer.output.value).toEqual([])
    expect(writer.writeText.value).toBe('A')
    await vi.runAllTimersAsync()
    await task
    expect(writer.output.value).toEqual(['AB'])
  })
})
