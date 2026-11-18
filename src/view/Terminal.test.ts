import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Terminal from './Terminal.vue'
import Input from '../components/Input/Input.vue'
import Output from '../components/Output/Output.vue'
import type { Command } from '../types'

describe('terminal', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    wrapper = mount(Terminal)
  })
  afterEach(() => {
    wrapper.unmount()
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  async function initialize() { await vi.runAllTimersAsync() }
  async function send(command: Command) {
    wrapper.getComponent(Input).vm.$emit('sendCommand', command)
    await vi.runAllTimersAsync()
  }

  it('initializes and enables the input', async () => {
    expect(wrapper.getComponent(Input).props('enable')).toBe(false)
    await initialize()
    expect(wrapper.text()).toContain('O QUE DESEJA SABER?')
    expect(wrapper.getComponent(Input).props('enable')).toBe(true)
  })

  it('runs help and clear commands', async () => {
    await initialize()
    await send({ question: '/HELP', answer: '' })
    expect(wrapper.text()).toContain('AJUDA FINALIZADA <<<')
    await send({ question: '/CLEAR', answer: '' })
    expect(wrapper.getComponent(Output).props('lines')).toEqual([])
  })

  it('keeps the about link functional', async () => {
    await initialize()
    await send({ question: '/ABOUT', answer: '' })
    const link = wrapper.get('a')
    expect(link.attributes('href')).toBe('https://diegomarques.com.br')
    expect(link.attributes('title')).toBe('Visite: https://diegomarques.com.br')
  })

  it('preserves the original fallback for a falsy numeric result', async () => {
    await initialize()
    await send({ question: '2 - 2', answer: '' })
    expect(wrapper.text()).toContain('RESPOSTA: [NÃO SEI AO CERTO SOBRE ISSO')
  })

  it('preserves non-finite arithmetic results', async () => {
    await initialize()
    await send({ question: '1 / 0', answer: '' })
    expect(wrapper.text()).toContain('RESPOSTA: [Infinity]')
  })

  it('preserves formatted HTML output', async () => {
    await initialize()
    await send({ question: 'TESTE', answer: '<strong>RESPOSTA FORMATADA</strong>' })
    expect(wrapper.get('strong').text()).toBe('RESPOSTA FORMATADA')
  })

  it('uses the fallback for an unknown question', async () => {
    await initialize()
    await send({ question: 'OI', answer: '' })
    expect(wrapper.text()).toContain('NÃO SEI AO CERTO SOBRE ISSO')
  })

  it('runs the Matrix sequence and clears the output', async () => {
    await initialize()
    await send({ question: '/MATRIX', answer: '' })
    expect(wrapper.getComponent(Output).props('lines')).toEqual([])
    expect(wrapper.getComponent(Input).props('enable')).toBe(true)
  })

  it('cancels pending timers on unmount', async () => {
    expect(vi.getTimerCount()).toBeGreaterThan(0)
    wrapper.unmount()
    await vi.runAllTimersAsync()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('waits 30ms before displaying the first character', async () => {
    expect(wrapper.getComponent(Input).props('write')).toBe('')
    await vi.advanceTimersByTimeAsync(29)
    expect(wrapper.getComponent(Input).props('write')).toBe('')
    await vi.advanceTimersByTimeAsync(1)
    expect(wrapper.getComponent(Input).props('write')).toBe('I')
  })

  it('retains the original initialization wording', async () => {
    await initialize()
    expect(wrapper.text()).toContain('CARREGANDO ALGORÍTIMOS DE INTERPRETAÇÃO DE LINGUAGEM NATURAL...')
  })

  it.each([
    ['2 ** 3', '8'],
    ['2 * -3', '-6'],
    ['1.5 + .25', '1.75'],
    ['2++3', 'Até tentei entender... Mas esta expressão matemática é inválida'],
    ['2 +', 'Até tentei entender... Mas esta expressão matemática é inválida'],
  ])('preserves the arithmetic behavior of %s', async (question, result) => {
    await initialize()
    await send({ question, answer: '' })
    expect(wrapper.text()).toContain(`RESPOSTA: [${result}]`)
  })

  it('does not animate calculation dots for a numeric result', async () => {
    await initialize()
    await send({ question: '/CLEAR', answer: '' })
    await send({ question: '2 + 3', answer: '' })
    expect(wrapper.getComponent(Output).props('lines')).not.toContain('.')
  })

  it('carries the secret from actual keystrokes through confirmation to the final response', async () => {
    await initialize()
    const input = wrapper.getComponent(Input)
    const field = input.get('textarea')
    await field.setValue(' ')
    for (const character of 'NEO') await field.setValue(field.element.value + character)
    expect(field.element.value).not.toContain('NEO')
    await field.trigger('keydown', { key: 'Enter' })
    expect(input.emitted('sendCommand')).toBeUndefined()
    await field.setValue(field.element.value + ' QUAL É O MEU NOME?')
    await field.trigger('keydown', { key: 'Enter' })
    expect(input.props('enable')).toBe(false)
    await vi.runAllTimersAsync()
    expect(wrapper.text()).toContain('RESPOSTA: [NEO]')
    expect(field.element.value).toBe('')
    expect(input.props('enable')).toBe(true)
  })

  it('clears output immediately without unlocking an ongoing animation', async () => {
    await initialize()
    const input = wrapper.getComponent(Input)
    input.vm.$emit('sendCommand', { question: '/HELP', answer: '' })
    await vi.advanceTimersByTimeAsync(1)
    expect(input.props('enable')).toBe(false)
    input.vm.$emit('sendCommand', { question: '/CLEAR', answer: '' })
    await wrapper.vm.$nextTick()
    expect(wrapper.getComponent(Output).props('lines')).toEqual([])
    expect(input.props('enable')).toBe(false)
    await vi.runAllTimersAsync()
    expect(wrapper.text()).toContain('AJUDA FINALIZADA <<<')
    expect(input.props('enable')).toBe(true)
  })

  it('keeps history after output animations and /CLEAR, restoring the draft', async () => {
    await initialize()
    const field = wrapper.get('textarea')
    await field.setValue('2 + 3')
    await field.trigger('keydown', { key: 'Enter' })
    await vi.runAllTimersAsync()
    await field.setValue('/CLEAR')
    await field.trigger('keydown', { key: 'Enter' })
    expect(wrapper.getComponent(Output).props('lines')).toEqual([])
    await field.setValue('RASCUNHO')
    await field.trigger('keydown', { key: 'ArrowUp' })
    expect(field.element.value).toBe('/CLEAR')
    await field.trigger('keydown', { key: 'ArrowUp' })
    expect(field.element.value).toBe('2 + 3')
    await field.trigger('keydown', { key: 'ArrowDown' })
    await field.trigger('keydown', { key: 'ArrowDown' })
    expect(field.element.value).toBe('RASCUNHO')
  })
})
