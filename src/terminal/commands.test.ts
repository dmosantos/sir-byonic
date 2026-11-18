import { ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTerminalCommands } from './commands'

function setup() {
  const output = ref<string[]>([])
  const write = vi.fn(async (_text: string, _pause?: number, _update?: boolean) => {})
  const clear = vi.fn(() => { output.value = [] })
  return { ...createTerminalCommands({ output, write, clear }), output, write, clear }
}

describe('command scripts compatibility', () => {
  afterEach(() => vi.restoreAllMocks())

  it('retains every initialization line, blank, spelling and explicit pause', async () => {
    const { initialize, write } = setup()
    await initialize()
    expect(write.mock.calls).toEqual([
      ['INITIALIZING...', 0],
      ['SIR-BYONIC v17.5.77', 0],
      ['', 0],
      ['IDENTIFYING LANGUAGE...', undefined],
      ['LANGUAGE DETECTED: PT-BR', undefined],
      ['', 0],
      ['CHANGING OUTPUT LANGUAGE...', 0],
      ['DONE <<<', undefined],
      ['CARREGANDO ALGORÍTIMOS DE INTERPRETAÇÃO DE LINGUAGEM NATURAL...', 0],
      ['FEITO <<<', undefined],
      ['CARREGANDO MALETAS DE TRANSMUTAÇÃO MORFOLÓGICA DE PERSONALIDADE...', 0],
      ['FEITO <<<', undefined],
      ['CARREGANDO FOCO, FORÇA E RAZÃO...', 0],
      ['FEITO <<<', undefined],
      ['CARREGANDO MENSAGENS DE BOAS VINDAS...', 0],
      ['.', undefined], ['.', undefined], ['.', undefined],
      ['OLÁ, SEJA BEM-VINDO.', undefined],
      ['SOU [SIR-BYONIC] - SIMULATED RESPONSE, BY ONIUM COMPUTERS.', undefined],
      ['O QUE DESEJA SABER?', undefined],
      ['', 0],
    ])
  })

  it('preserves Matrix message order, pauses and clearing before and after messages', async () => {
    const { processCommand, write, clear } = setup()
    const events: unknown[] = []
    clear.mockImplementation(() => { events.push('clear') })
    write.mockImplementation(async (...args) => { events.push(args) })
    await processCommand({ question: '/MATRIX', answer: '' })
    expect(events).toEqual([
      'clear', ['Wake up, Neo...', 3000],
      'clear', ['The Matrix has you...', 3000],
      'clear', ['Follow the white rabbit.', 3000],
      'clear', ['Knock, knock, Neo.', 5000],
      'clear',
    ])
  })

  it('keeps help text and its blank lines', async () => {
    const { processCommand, write } = setup()
    await processCommand({ question: '/HELP', answer: '' })
    expect(write.mock.calls).toEqual([
      ['', 0], ['', 0], ['CARREGANDO AJUDA...', 0],
      ['VOCÊ PODE ME CONTAR SEGREDOS SE ME DER UM ESPAÇO...', undefined],
      ['/FULLSCREEN: ALTERNA TELA CHEIA. ESC SAI DA TELA CHEIA.', 0],
      ['USE ↑ E ↓ PARA NAVEGAR PELO HISTÓRICO DE PERGUNTAS.', 0],
      ['AJUDA FINALIZADA <<<', undefined],
    ])
  })

  it('keeps all 100 progress updates in place with 10ms pauses', async () => {
    const { processCommand, write } = setup()
    await processCommand({ question: '2 + 3', answer: '' })
    expect(write.mock.calls).toEqual([
      ['ENVIANDO PERGUNTA: [2 + 3]', 0],
      ['CALCULANDO...'],
      ['CÁLCULO FINALIZADO <<<'],
      ['PREPARANDO RESPOSTA...', 10],
      ['0% CONCLUÍDO', 10],
      ...Array.from({ length: 100 }, (_, i) => [`${i + 1}% CONCLUÍDO`, 10, true]),
      ['', 0], ['RESPOSTA: [5]', 0], ['', 0],
    ])
  })

  it('re-evaluates random for each dot instead of choosing a fixed count', async () => {
    const random = vi.spyOn(Math, 'random').mockReturnValueOnce(.9).mockReturnValue(0)
    const { processCommand, write } = setup()
    await processCommand({ question: 'TESTE', answer: 'ABCDEFGHIJ' })
    expect(write.mock.calls.filter(([text]) => text === '.')).toEqual([['.']])
    expect(random).toHaveBeenCalledTimes(2)
  })

  it('keeps blank separation only when output already exists', async () => {
    const { processCommand, write, output } = setup()
    output.value = ['EXISTING']
    await processCommand({ question: '2 + 3', answer: '' })
    expect(write.mock.calls.slice(0, 3)).toEqual([
      ['', 0], ['', 0], ['ENVIANDO PERGUNTA: [2 + 3]', 0],
    ])
  })
})
