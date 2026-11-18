import { ref, watch } from 'vue'
import type { Command } from '../types'
import { disguisePhrases } from '../terminal/content'

interface InputCallbacks {
  onSend: (command: Command) => void
  onReset: () => void
  onTextChange: () => void
}

/** Command and secret-entry state; DOM events, focus and caret stay in Input.vue. */
export function useCommandInput({ onSend, onReset, onTextChange }: InputCallbacks) {
  const inputText = ref<string | null | undefined>(null)
  const command = ref<Command>({ question: '', answer: '' })
  // Remains active after the first Enter, until the question is submitted or cancelled.
  const secretActive = ref(false)
  let answering = false
  let selectedPhrase = 0
  let phrases = shufflePhrases()
  let phrasePosition = 0

  function shufflePhrases() {
    // Keep the original random call pattern and ordering algorithm.
    return [...disguisePhrases].sort(() => Math.random() - 0.5)
  }

  watch(inputText, (value) => {
    command.value.question = (value || '').toUpperCase()
    onTextChange()
  })

  function cancel() {
    inputText.value = null
    command.value = { question: '', answer: '' }
    answering = false
    secretActive.value = false
    onReset()
    selectedPhrase = 0
    phrases = shufflePhrases()
    phrasePosition = 0
  }

  function acceptInput(text: string) {
    const value = text.toUpperCase()
    if (command.value.question === '' && value === ' ') {
      cancel()
      answering = true
      secretActive.value = true
      command.value.answer = ''
      selectedPhrase = 0
    }
    if (answering) {
      if (value.length > (inputText.value || '').length) {
        command.value.answer += value.slice(-1)
        if (phrases[selectedPhrase]!.length <= phrasePosition) {
          selectedPhrase = selectedPhrase + 1 === phrases.length ? 0 : selectedPhrase + 1
          phrasePosition = 0
        }
        const index = value.length - 1
        const newValue = phrases[selectedPhrase]![phrasePosition]!
        inputText.value = value.slice(0, index) + newValue + value.slice(index + newValue.length)
        phrasePosition++
      } else {
        // Compatibility: deletion does not rewind the disguise's character position.
        command.value.answer = String(command.value.answer).slice(0, -1)
        inputText.value = (inputText.value || '').slice(0, -1)
      }
    } else {
      inputText.value = value
    }
  }

  function sendCommand() {
    if (!command.value.question) return
    if (answering) {
      answering = false
      command.value.answer = String(command.value.answer).trim()
      return
    }
    command.value.question = command.value.question.trim()
    onSend(command.value)
    cancel()
  }

  return { inputText, command, secretActive, acceptInput, cancel, sendCommand }
}
