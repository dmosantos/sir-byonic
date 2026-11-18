/** Content and timing are compatibility data: changes affect the terminal experience. */
export const timing = {
  character: 30,
  pauseMin: 100,
  pauseMax: 1000,
  progress: 10,
} as const

export type ScriptLine = readonly [text: string, pause?: number]

export const initialization: readonly ScriptLine[] = [
  ['INITIALIZING...', 0],
  ['SIR-BYONIC v17.5.77', 0],
  ['', 0],
  ['IDENTIFYING LANGUAGE...'],
  ['LANGUAGE DETECTED: PT-BR'],
  ['', 0],
  ['CHANGING OUTPUT LANGUAGE...', 0],
  ['DONE <<<'],
  ['CARREGANDO ALGORÍTIMOS DE INTERPRETAÇÃO DE LINGUAGEM NATURAL...', 0],
  ['FEITO <<<'],
  ['CARREGANDO MALETAS DE TRANSMUTAÇÃO MORFOLÓGICA DE PERSONALIDADE...', 0],
  ['FEITO <<<'],
  ['CARREGANDO FOCO, FORÇA E RAZÃO...', 0],
  ['FEITO <<<'],
  ['CARREGANDO MENSAGENS DE BOAS VINDAS...', 0],
  ['.'],
  ['.'],
  ['.'],
  ['OLÁ, SEJA BEM-VINDO.'],
  ['SOU [SIR-BYONIC] - SIMULATED RESPONSE, BY ONIUM COMPUTERS.'],
  ['O QUE DESEJA SABER?'],
  ['', 0],
]

export const help: readonly ScriptLine[] = [
  ['', 0],
  ['', 0],
  ['CARREGANDO AJUDA...', 0],
  ['VOCÊ PODE ME CONTAR SEGREDOS SE ME DER UM ESPAÇO...'],
  ['/FULLSCREEN: ALTERNA TELA CHEIA. ESC SAI DA TELA CHEIA.', 0],
  ['USE ↑ E ↓ PARA NAVEGAR PELO HISTÓRICO DE PERGUNTAS.', 0],
  ['AJUDA FINALIZADA <<<'],
]

export const about: readonly ScriptLine[] = [
  ['', 0],
  ['', 0],
  ['DESENVOLVIDO POR: DIEGO MARQUES', 0],
  ['<a href="https://diegomarques.com.br" title="Visite: https://diegomarques.com.br" target="_blank">HTTPS://DIEGOMARQUES.COM.BR</a>', 0],
]

export const matrix: readonly ScriptLine[] = [
  ['Wake up, Neo...', 3000],
  ['The Matrix has you...', 3000],
  ['Follow the white rabbit.', 3000],
  ['Knock, knock, Neo.', 5000],
]

export const messages = {
  fallback: 'NÃO SEI AO CERTO SOBRE ISSO... VOCÊ NÃO FEZ A PERGUNTA CORRETAMENTE',
  invalidExpression: 'Até tentei entender... Mas esta expressão matemática é inválida',
  fullscreenUnsupported: 'TELA CHEIA NÃO ESTÁ DISPONÍVEL NESTE NAVEGADOR. TENTE F11 NO COMPUTADOR.',
  fullscreenDenied: 'NÃO FOI POSSÍVEL ALTERNAR A TELA CHEIA. VERIFIQUE AS PERMISSÕES DO NAVEGADOR.',
  question: (text: string) => `ENVIANDO PERGUNTA: [${text}]`,
  calculating: 'CALCULANDO...',
  calculated: 'CÁLCULO FINALIZADO <<<',
  preparing: 'PREPARANDO RESPOSTA...',
  progress: (value: number) => `${value}% CONCLUÍDO`,
  answer: (value: string | number) => `RESPOSTA: [${value}]`,
} as const

export const disguisePhrases = [
  'Querida máquina pensante, ',
  'Grande ser dotado de inteligência ilimitada, ',
  'Meu querido computador, ',
  'Excelentíssimo circuito integrado, ',
  'Venho por meio desta, ',
  'Por favor minha querida máquina calculante, ',
  'Gostaria que me respondesse, ',
  'Com toda sua sabedoria, ',
] as const
