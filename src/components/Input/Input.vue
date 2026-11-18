<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Command } from '../../types'
import { useCommandInput } from '../../composables/useCommandInput'
import { createCommandHistory } from '../../terminal/history'

const props = withDefaults(defineProps<{ enable?: boolean; write?: string | null }>(), {
  enable: true,
})
const emit = defineEmits<{ sendCommand: [command: Command] }>()
const field = ref<HTMLTextAreaElement | null>(null)
const caret = ref<HTMLSpanElement | null>(null)
const caretPosition = ref(0)
const caretOffset = ref<[number, number]>([0, 0])
const fieldHeight = ref<number | null>(null)
const history = createCommandHistory()
const { inputText, command, secretActive, acceptInput, cancel, sendCommand } = useCommandInput({
  onSend: (value) => {
    // Record before the parent calculates or mutates the answer; never retain the object.
    history.record(value.question)
    emit('sendCommand', value)
  },
  onReset: () => {
    history.resetNavigation()
    caretPosition.value = 0
    caretOffset.value = [0, 0]
    fieldHeight.value = null
  },
  onTextChange: updateCaretOffset,
})

const textStart = computed(() => {
  const question = props.enable ? command.value.question || '' : props.write || ''
  const position = props.enable ? caretPosition.value : question.length
  return question.slice(0, position)
})

watch(() => props.write, (value) => {
  inputText.value = value
  updateCaretOffset()
  updateFieldHeight()
})

function onInput(event: Event) {
  event.preventDefault()
  const element = event.target as HTMLTextAreaElement
  history.resetNavigation()
  acceptInput(element.value || '')
  onChange(event)
}

function onKeydown(event: KeyboardEvent) {
  const isHistoryKey = event.key === 'ArrowUp' || event.key === 'ArrowDown'
  if (isHistoryKey && props.enable && !secretActive.value && !event.isComposing
    && !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey) {
    const text = event.key === 'ArrowUp'
      ? history.previous(inputText.value || '')
      : history.next()
    if (text !== undefined) {
      event.preventDefault()
      inputText.value = text
      void nextTick(() => {
        const element = field.value
        if (!element) return
        element.setSelectionRange(text.length, text.length)
        caretPosition.value = text.length
        updateFieldHeight()
        updateCaretOffset()
      })
      return
    }
  }
  onChange(event)
}

function updateCaretOffset() {
  void nextTick(() => {
    caretOffset.value = caret.value ? [caret.value.offsetLeft, caret.value.offsetTop] : [0, 0]
  })
  window.scrollTo(0, document.body.scrollHeight)
}

function updateFieldHeight() {
  if (field.value) fieldHeight.value = field.value.scrollHeight
}

function onChange(event: Event) {
  const element = event.target as HTMLTextAreaElement
  caretPosition.value = element.selectionStart
  fieldHeight.value = element.scrollHeight
  updateCaretOffset()
  if (!props.enable) event.preventDefault()
}

function doFocus() { field.value?.focus() }
window.addEventListener('focus', doFocus)
onMounted(doFocus)
onBeforeUnmount(() => window.removeEventListener('focus', doFocus))
</script>

<template>
  <div :class="$style.input">
    <div :class="$style.container" @click="doFocus">
      <div :class="$style.caret" :style="{ left: caretOffset[0] + 'px', top: caretOffset[1] + 'px' }" />
      <textarea
        ref="field"
        :class="$style.field"
        :style="{ height: fieldHeight ? fieldHeight + 'px' : 'auto' }"
        :value="inputText"
        @input="onInput"
        @keydown="onKeydown"
        @keydown.esc.prevent="cancel"
        @keydown.enter.prevent="sendCommand"
        @keyup="onChange"
        @click="onChange"
        @focus="onChange"
        @blur="doFocus"
        type="text"
        rows="1"
        autofocus
      />
    </div>
    <div :class="[$style.container, $style.mirror]" @click="doFocus">
      <div :class="$style.field">{{ textStart }}<span ref="caret" :class="$style.caret" /></div>
    </div>
  </div>
</template>

<style module>
.input { margin: 0 2rem 2rem; position: relative; }
.container { position: relative; }
.field {
  animation: glow .05s linear infinite alternate;
  background: transparent;
  border: 0 none;
  caret-color: transparent;
  color: var(--primary-text-color);
  font-family: 'Courier Prime', monospace;
  font-size: 1rem;
  font-weight: 700;
  overflow: hidden;
  overflow-wrap: break-word;
  padding: 0;
  position: relative;
  resize: none;
  text-transform: uppercase;
  text-shadow: 0 0 5px var(--color-4), 0 0 5px var(--color-1), 0 0 5px var(--color-4);
  width: 100%;
  word-wrap: break-word;
  white-space: pre-wrap;
  z-index: 5;
  &:focus { outline: none; }
}
.mirror { left: 0; opacity: 0; position: absolute; top: 0; z-index: 1; }
.caret {
  animation: cursor .2s linear infinite alternate;
  border-radius: 2px;
  content: '';
  background-color: var(--primary-text-color);
  display: inline-block;
  height: 1em;
  margin-left: -.05em;
  margin-right: -.65em;
  position: absolute;
  vertical-align: top;
  width: .7em;
}
@keyframes cursor {
  0%, 70% { box-shadow: 0 0 3px 0 var(--color-4), 0 0 5px 0 var(--color-1), 0 0 3px 0 var(--color-4); opacity: 1; }
  75%, 100% { box-shadow: 0 0 5px 0 var(--color-4), 0 0 5px 0 var(--color-1), 0 0 5px 0 var(--color-4); opacity: .1; }
}
</style>
