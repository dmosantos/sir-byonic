import { describe, expect, it } from 'vitest'
import { createCommandHistory } from './history'

describe('session command history', () => {
  it('navigates newest first, clamps at the oldest and restores the draft', () => {
    const history = createCommandHistory()
    history.record('PRIMEIRA')
    history.record('SEGUNDA')
    expect(history.previous('RASCUNHO')).toBe('SEGUNDA')
    expect(history.previous('SEGUNDA')).toBe('PRIMEIRA')
    expect(history.previous('PRIMEIRA')).toBe('PRIMEIRA')
    expect(history.next()).toBe('SEGUNDA')
    expect(history.next()).toBe('RASCUNHO')
    expect(history.next()).toBeUndefined()
  })

  it('returns nothing with no history and ignores blank and consecutive duplicate entries', () => {
    const history = createCommandHistory()
    expect(history.previous('DRAFT')).toBeUndefined()
    expect(history.next()).toBeUndefined()
    history.record(' ')
    history.record(' /HELP ')
    history.record('/HELP')
    history.record('')
    expect(history.previous('')).toBe('/HELP')
    expect(history.previous('')).toBe('/HELP')
    expect(history.next()).toBe('')
  })

  it('caps memory at the configured number of visible strings', () => {
    const history = createCommandHistory(2)
    history.record('OLD')
    history.record('MIDDLE')
    history.record('NEW')
    expect(history.previous('')).toBe('NEW')
    expect(history.previous('')).toBe('MIDDLE')
    expect(history.previous('')).toBe('MIDDLE')
  })

  it('starts a new draft after editing or cancelling navigation', () => {
    const history = createCommandHistory()
    history.record('SENT')
    expect(history.previous('ORIGINAL DRAFT')).toBe('SENT')
    history.resetNavigation()
    expect(history.previous('EDITED')).toBe('SENT')
    expect(history.next()).toBe('EDITED')
  })

  it('does not share entries across instances or persist them in browser storage', () => {
    const first = createCommandHistory()
    first.record('ONLY VISIBLE QUESTION')
    expect(createCommandHistory().previous('')).toBeUndefined()
    expect(localStorage.length).toBe(0)
    expect(sessionStorage.length).toBe(0)
  })
})
