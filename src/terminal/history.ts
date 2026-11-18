/** Session-only visible questions. This API deliberately never accepts a Command or answer. */
export function createCommandHistory(limit = 100) {
  if (!Number.isInteger(limit) || limit < 1) throw new RangeError('Invalid history limit')
  const entries: string[] = []
  let position = 0
  let navigating = false
  let draft = ''

  function resetNavigation() {
    position = entries.length
    navigating = false
    draft = ''
  }

  function record(question: string) {
    const text = question.trim()
    if (text && entries.at(-1) !== text) {
      entries.push(text)
      if (entries.length > limit) entries.shift()
    }
    resetNavigation()
  }

  function previous(currentDraft: string): string | undefined {
    if (!entries.length) return undefined
    if (!navigating) {
      draft = currentDraft
      position = entries.length
      navigating = true
    }
    if (position > 0) position--
    return entries[position]
  }

  function next(): string | undefined {
    if (!navigating) return undefined
    if (position < entries.length - 1) return entries[++position]
    const savedDraft = draft
    resetNavigation()
    return savedDraft
  }

  return { record, previous, next, resetNavigation }
}
