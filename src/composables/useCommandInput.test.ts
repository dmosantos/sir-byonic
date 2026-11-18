import { effectScope, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useCommandInput } from './useCommandInput'

describe('command entry compatibility', () => {
  let scope: ReturnType<typeof effectScope>
  let entry: ReturnType<typeof useCommandInput>
  const onSend = vi.fn()
  const onReset = vi.fn()
  const onTextChange = vi.fn()

  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(.5)
    scope = effectScope()
    entry = scope.run(() => useCommandInput({ onSend, onReset, onTextChange }))!
  })
  afterEach(() => {
    scope.stop()
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  async function type(text: string) {
    for (const character of text) {
      entry.acceptInput((entry.inputText.value || '') + character)
      await nextTick()
    }
  }

  it('shows disguises across phrase boundaries and wraps without exposing the secret', async () => {
    const phrases = [
      'Querida máquina pensante, ',
      'Grande ser dotado de inteligência ilimitada, ',
      'Meu querido computador, ',
      'Excelentíssimo circuito integrado, ',
      'Venho por meio desta, ',
      'Por favor minha querida máquina calculante, ',
      'Gostaria que me respondesse, ',
      'Com toda sua sabedoria, ',
    ].join('').toUpperCase()
    await type(' ')
    const secret = 'Z'.repeat(phrases.length + 10)
    await type(secret)
    expect(entry.inputText.value?.toUpperCase()).toBe(phrases + phrases.slice(0, 11))
    expect(onSend).not.toHaveBeenCalled()
    entry.sendCommand()
    expect(onSend).not.toHaveBeenCalled()
    await type(' QUEM SOU EU?')
    entry.sendCommand()
    expect(onSend).toHaveBeenCalledOnce()
    expect(onSend.mock.calls[0]?.[0]).toMatchObject({ answer: secret })
    expect(entry.inputText.value).toBeNull()
  })

  it('preserves the original last-character behavior for a pasted secret', async () => {
    await type(' ')
    entry.acceptInput(entry.inputText.value + 'COLADO')
    await nextTick()
    entry.sendCommand()
    entry.sendCommand()
    expect(onSend.mock.calls[0]?.[0]).toMatchObject({ answer: 'O' })
  })

  it('cancels without reusing a previous secret', async () => {
    await type(' SEGREDO')
    entry.cancel()
    await nextTick()
    await type('PERGUNTA')
    entry.sendCommand()
    expect(onSend.mock.calls[0]?.[0]).toEqual({ question: 'PERGUNTA', answer: '' })
    expect(onReset).toHaveBeenCalledTimes(3) // activation, Escape, and submission.
  })

  it('synchronizes output text to the question and resets it when output clears', async () => {
    entry.inputText.value = 'Wake up, Neo...'
    await nextTick()
    expect(entry.command.value.question).toBe('WAKE UP, NEO...')
    entry.inputText.value = null
    await nextTick()
    expect(entry.command.value.question).toBe('')
    expect(onTextChange).toHaveBeenCalledTimes(2)
    entry.sendCommand()
    expect(onSend).not.toHaveBeenCalled()
  })
})
