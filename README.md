# SIR-BYONIC

**Simulated Response, By Onium Computers.** Terminal retrô de perguntas e respostas, desenvolvido por Diego Marques. É uma simulação para entretenimento, sem IA ou backend.

## Stack

- Vue 3 com Composition API e `<script setup>`.
- Vite, TypeScript em modo estrito e checagem de componentes com `vue-tsc`.
- CSS nativo: custom properties, nesting e CSS Modules. Sem Sass, preservando os estilos e animações originais.
- Vitest, Vue Test Utils e jsdom para testes.

## Desenvolvimento

Requer Node.js `^22.12.0`, `^24.0.0` ou `>=26.0.0` (recomendado: Node 24 LTS) e npm. O requisito considera também as ferramentas de teste.

```sh
npm ci
npm run dev
```

Abra o endereço informado pelo Vite. `npm run serve` também funciona como alias de `dev`.

```sh
npm run typecheck  # valida TypeScript e templates Vue
npm test           # testes automatizados
npm run build      # checa tipos e gera dist/
npm run preview    # serve o build localmente
```

Publique o conteúdo de `dist/` em uma hospedagem estática. O arquivo `index.html` fica na raiz, como entrada do Vite; os ícones continuam em `public/`. A fonte Courier Prime é carregada do Google Fonts, com fallback monospace.

## Como usar

- `/HELP`: mostra a dica do modo secreto.
- `/CLEAR`: limpa a tela.
- `/ABOUT`: exibe os créditos.
- `/MATRIX`: reproduz a sequência inspirada no filme.
- `/FULLSCREEN`: entra ou sai da tela cheia, quando a API do navegador está disponível. Digite o comando e pressione Enter; nenhuma ativação automática. Escape também sai da tela cheia pelo navegador. Se a API não estiver disponível ou o acesso for recusado, o terminal informa o motivo sem interromper a sessão.
- `↑` / `↓`: recupera perguntas e comandos visíveis enviados. Ao voltar além da entrada mais recente, restaura o rascunho que você estava digitando.
- Expressões como `(2 + 3) * 4`: calculadora com a sintaxe e os resultados originais, incluindo `**`, decimais com ponto e resultados não finitos.

### Modo secreto

1. Com o campo vazio, digite um espaço para ativar a entrada oculta.
2. Digite a resposta desejada. O terminal mostra frases de disfarce em vez do texto real.
3. Pressione Enter para confirmar a resposta oculta.
4. Continue digitando a pergunta e pressione Enter novamente para enviá-la.

Escape cancela a entrada e apaga o segredo. Sem uma resposta oculta ou expressão matemática válida, o terminal usa sua mensagem padrão.

### Histórico e privacidade

O histórico guarda até 100 entradas visíveis na memória da sessão, sem respostas ocultas e sem `localStorage`, cookies ou servidor. Repetições consecutivas são ignoradas. Recarregar a página apaga o histórico; `/CLEAR` limpa apenas a tela. Editar uma entrada recuperada inicia um novo rascunho. As setas com modificadores ou durante a composição de texto mantêm sua função normal; durante a edição do segredo e depois da sua confirmação, o histórico não é consultado até enviar ou cancelar a pergunta. Recuperar uma pergunta antiga nunca recupera a resposta secreta associada a ela. Textos que você digitar de forma visível continuam sendo conteúdo visível, inclusive no histórico.

## Estrutura

- `src/view/Terminal.vue`: composição visual do terminal.
- `src/composables/useTerminal.ts`: ciclo de vida e estado de disponibilidade da entrada.
- `src/composables/useTerminalWriter.ts`: escrita animada, saída, rolagem e limpeza dos timers.
- `src/terminal/commands.ts`: execução dos comandos e roteiro de respostas.
- `src/terminal/content.ts`: textos, frases de disfarce, sequências e tempos originais.
- `src/terminal/history.ts`: histórico limitado às perguntas visíveis, somente em memória.
- `src/terminal/fullscreen.ts`: integração opcional com a Fullscreen API e tratamento de indisponibilidade/recusa.
- `src/composables/useCommandInput.ts`: estado da pergunta e do modo secreto, sem dependência do DOM.
- `src/components/Input/Input.vue`: eventos de entrada, foco, medição e desenho do cursor.
- `src/components/Output/Output.vue`: saída HTML e link de créditos, como no original.
- `src/style/main.css`: tema global e estilos responsivos.

A migração substitui Vue CLI, Webpack e Babel por Vite, remove Sass e dependências legadas e mantém a experiência original. Não há necessidade de Router, Pinia ou Nuxt para a aplicação de tela única.

A migração técnica preserva foco, edição do modo secreto, mensagens, temporização, estilos e peculiaridades da calculadora. As extensões de comportamento posteriores são o comando opcional `/FULLSCREEN`, o histórico com setas e suas dicas em `/HELP`. Por compatibilidade, a calculadora continua usando `eval()` após o filtro original de caracteres e a saída continua usando `v-html`. Isso não representa endurecimento de segurança; mudanças nesses pontos devem ser tratadas separadamente.

## Testes de compatibilidade

Os testes cobrem os módulos isoladamente e os componentes integrados: digitação a cada 30ms, pausas, linhas vazias, progresso, sequência Matrix, foco, edição e cancelamento de segredos, troca de frases e peculiaridades da calculadora. Os valores esperados nos testes são explícitos para detectar alterações acidentais no conteúdo e nos tempos; não devem ser atualizados automaticamente para aceitar diferenças de comportamento. Os testes de DOM usam jsdom, não substituem uma comparação visual em navegador.

Tela cheia tem testes da API simulada e do caminho completo desde Enter, incluindo recusa e falta de suporte; a mudança nativa da janela depende do navegador. O histórico tem testes de navegação, limite de memória, restauração de rascunho e isolamento das respostas secretas.

## Auditoria de dependências

Na validação da migração, `npm audit --omit=dev` não apontou vulnerabilidades de produção. A auditoria completa ainda aponta alertas transitivos nas ferramentas de desenvolvimento (`picomatch`, `glob` e `minimatch`). Foram aplicadas as correções compatíveis disponíveis via `npm audit fix`, sem forçar downgrades das ferramentas. Consulte `npm audit` para o estado atualizado e não exponha o servidor de desenvolvimento à internet.
