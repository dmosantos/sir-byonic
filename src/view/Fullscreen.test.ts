import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Terminal from './Terminal.vue'
import Input from '../components/Input/Input.vue'
import Output from '../components/Output/Output.vue'

describe('fullscreen command integration', () => {
  let wrapper: VueWrapper
  let activeElement: Element | null
  let restoreProperties: (() => void)[]
  const request = vi.fn(async () => { activeElement = document.documentElement })
  const exit = vi.fn(async () => { activeElement = null })

  function define(target: object, key: string, descriptor: PropertyDescriptor) {
    const previous = Object.getOwnPropertyDescriptor(target, key)
    restoreProperties.push(() => {
      if (previous) Object.defineProperty(target, key, previous)
      else Reflect.deleteProperty(target, key)
    })
    Object.defineProperty(target, key, { configurable: true, ...descriptor })
  }

  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    activeElement = null
    restoreProperties = []
    define(document, 'fullscreenEnabled', { value: true })
    define(document, 'fullscreenElement', { get: () => activeElement })
    define(document, 'exitFullscreen', { value: exit })
    define(document.documentElement, 'requestFullscreen', { value: request })
    wrapper = mount(Terminal)
  })

  afterEach(() => {
    wrapper.unmount()
    for (const restore of restoreProperties.reverse()) restore()
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
    request.mockClear()
    exit.mockClear()
  })

  it('only toggles on explicit Enter and calls the API inside that same event', async () => {
    await vi.runAllTimersAsync()
    expect(request).not.toHaveBeenCalled()
    const originalOutput = [...wrapper.getComponent(Output).props('lines')]
    const input = wrapper.getComponent(Input)
    const field = input.get('textarea')
    await field.setValue('/FULLSCREEN')
    field.element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
    expect(request).toHaveBeenCalledOnce()
    await vi.runAllTimersAsync()
    expect(activeElement).toBe(document.documentElement)
    expect(wrapper.getComponent(Output).props('lines')).toEqual(originalOutput)
    expect(field.element.value).toBe('')
    expect(input.props('enable')).toBe(true)
    await field.setValue('/FULLSCREEN')
    await field.trigger('keydown', { key: 'Enter' })
    await vi.runAllTimersAsync()
    expect(exit).toHaveBeenCalledOnce()
    expect(activeElement).toBeNull()
  })

  it('reports unsupported fullscreen and leaves the terminal usable', async () => {
    await vi.runAllTimersAsync()
    Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, value: false })
    const field = wrapper.get('textarea')
    await field.setValue('/FULLSCREEN')
    await field.trigger('keydown', { key: 'Enter' })
    await vi.runAllTimersAsync()
    expect(request).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('TELA CHEIA NÃO ESTÁ DISPONÍVEL')
    expect(wrapper.getComponent(Input).props('enable')).toBe(true)
    await field.trigger('keydown', { key: 'ArrowUp' })
    expect(field.element.value).toBe('/FULLSCREEN')
  })

  it('reports denied permission without an unhandled rejection', async () => {
    await vi.runAllTimersAsync()
    request.mockRejectedValueOnce(new Error('Permission denied'))
    const field = wrapper.get('textarea')
    await field.setValue('/FULLSCREEN')
    await field.trigger('keydown', { key: 'Enter' })
    await vi.runAllTimersAsync()
    expect(wrapper.text()).toContain('NÃO FOI POSSÍVEL ALTERNAR A TELA CHEIA')
    expect(wrapper.getComponent(Input).props('enable')).toBe(true)
    expect(activeElement).toBeNull()
  })
})
