import type { Command } from '../types'
import type { TerminalWriter } from '../composables/useTerminalWriter'
import { about, help, initialization, matrix, messages, timing, type ScriptLine } from './content'

type CommandOutput = Pick<TerminalWriter, 'output' | 'write' | 'clear'>

/** Command scripts know nothing about component lifecycles, focus or the caret. */
export function createTerminalCommands({ output, write, clear }: CommandOutput) {
  async function play(lines: readonly ScriptLine[]) {
    for (const [text, pause] of lines) await write(text, pause)
  }

  async function initialize() { await play(initialization) }

  async function showAnswer(command: Command) {
    if (!command.answer) command.answer = messages.fallback
    if (output.value.length) {
      await write('', 0)
      await write('', 0)
    }
    await write(messages.question(command.question), 0)
    await write(messages.calculating)
    // Compatibility: numbers have no length; random is re-evaluated on each iteration.
    const answerLength = typeof command.answer === 'string' ? command.answer.length : Number.NaN
    for (let i = 0; i < Math.random() * (answerLength / 2 - 1) + 1; i++) await write('.')
    await write(messages.calculated)
    await write(messages.preparing, timing.progress)
    await write(messages.progress(0), timing.progress)
    for (let i = 1; i <= 100; i++) await write(messages.progress(i), timing.progress, true)
    await write('', 0)
    await write(messages.answer(command.answer), 0)
    await write('', 0)
  }

  async function processCommand(command: Command) {
    switch (command.question) {
      case '/CLEAR':
        clear()
        break
      case '/HELP':
        await play(help)
        break
      case '/ABOUT':
        await play(about)
        break
      case '/MATRIX':
        for (const [text, pause] of matrix) {
          clear()
          await write(text, pause)
        }
        clear()
        break
      default:
        // Intentionally unchanged: syntax, errors and falsy results are legacy behavior.
        if (/^[0-9( ).*/+\-]+$/g.test(command.question)) {
          try { command.answer = eval(command.question) as string | number }
          catch { command.answer = messages.invalidExpression }
        }
        await showAnswer(command)
    }
  }

  return { initialize, processCommand }
}
