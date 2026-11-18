import { nextTick, ref } from 'vue'
import { timing } from '../terminal/content'

export type TerminalWriter = ReturnType<typeof useTerminalWriter>

/** Owns animated output and its timers, independently of commands and input. */
export function useTerminalWriter() {
  const output = ref<string[]>([])
  const writeText = ref<string | null>(null)
  const controller = new AbortController()

  function write(
    text: string,
    timeout = Math.random() * (timing.pauseMax - timing.pauseMin) + timing.pauseMin,
    update = false,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const { signal } = controller
      if (signal.aborted) { reject(signal.reason); return }
      let interval: number | undefined
      let timer: number | undefined
      const onAbort = () => {
        window.clearInterval(interval)
        window.clearTimeout(timer)
        reject(signal.reason)
      }
      signal.addEventListener('abort', onAbort, { once: true })
      const doWrite = () => {
        if (update) output.value[output.value.length - 1] = text
        else output.value.push(text)
        writeText.value = null
        void nextTick(() => window.scrollTo(0, document.body.scrollHeight))
        timer = window.setTimeout(() => {
          signal.removeEventListener('abort', onAbort)
          resolve()
        }, timeout)
      }
      if (update) doWrite()
      else {
        writeText.value = ''
        let i = 0
        interval = window.setInterval(() => {
          writeText.value += text[i] ?? ''
          i++
          if (i >= text.length) {
            doWrite()
            window.clearInterval(interval)
          }
        }, timing.character)
      }
    })
  }

  function clear() { output.value = [] }
  function dispose() { controller.abort() }

  return { output, writeText, write, clear, dispose, signal: controller.signal }
}
