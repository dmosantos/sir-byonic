import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { Command } from '../types'
import { createTerminalCommands } from '../terminal/commands'
import { useTerminalWriter } from './useTerminalWriter'
import { toggleFullscreen } from '../terminal/fullscreen'
import { messages } from '../terminal/content'

/** Connects lifecycle and enabled state to the independent writer and command scripts. */
export function useTerminal() {
  const writer = useTerminalWriter()
  const commands = createTerminalCommands(writer)
  const enable = ref(false)

  async function run(action: () => Promise<void>) {
    enable.value = false
    try { await action() }
    catch (error) { if (!writer.signal.aborted) console.error('Erro no terminal:', error) }
    finally { if (!writer.signal.aborted) enable.value = true }
  }

  function sendCommand(command: Command) {
    // Clear is synchronous and does not change enabled state, as in the original.
    if (command.question === '/CLEAR') {
      writer.clear()
      return
    }
    if (command.question === '/FULLSCREEN') {
      void run(async () => {
        // Request immediately in the user's Enter event; do not animate before it.
        const result = await toggleFullscreen()
        if (!writer.signal.aborted && result !== 'changed') {
          await writer.write(result === 'unsupported' ? messages.fullscreenUnsupported : messages.fullscreenDenied, 0)
        }
      })
      return
    }
    void run(() => commands.processCommand(command))
  }

  onMounted(() => { void run(commands.initialize) })
  onBeforeUnmount(writer.dispose)

  return { output: writer.output, writeText: writer.writeText, enable, sendCommand }
}
