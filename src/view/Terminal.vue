<template>
    <MainTemplate>

        <Output
            :lines="output"
        />

        <Input
            @send-command="sendCommand"
            :enable="enable"
        />

    </MainTemplate>
</template>

<script>

import MainTemplate from '@/view/template/MainTemplate';
import Output from '@/components/Output/Output';
import Input from '@/components/Input/Input';

export default {

    name: 'Terminal',

    components: {
        MainTemplate,
        Output,
        Input
    },

    data() {
        return {

            output: [],
            enable: false

        }
    },

    mounted() {

        this.initialize();

    },

    methods: {

        async initialize() {

            this.enable = false;
        
            await this.write('INITIALIZING...', 0);
            await this.write('IDENTIFYING LANGUAGE...');
            await this.write('LANGUAGE DETECTED: PT-BR');
            await this.write('', 0);
            await this.write('CHANGING OUTPUT LANGUAGE...', 0);
            await this.write('DONE <<<');
            await this.write('CARREGANDO ALGORÍTIMOS DE INTERPRETAÇÃO DE LINGUAGEM NATURAL...', 0);
            await this.write('FEITO <<<');
            await this.write('CARREGANDO MALETAS DE TRANSMUTAÇÃO MORFOLÓGICA DE PERSONALIDADE...', 0);
            await this.write('FEITO <<<');
            await this.write('CARREGANDO FOCO, FORÇA E RAZÃO...', 0);
            await this.write('FEITO <<<');
            await this.write('CARREGANDO MENSAGENS DE BOAS VINDAS...', 0);
            await this.write('.');
            await this.write('.');
            await this.write('.');
            await this.write('OLÁ, SEJA BEM-VINDO.');
            await this.write('SOU [SIR-BYONIC] - SIMULATED RESPONSE, BY ONIUM COMPUTERS.');
            await this.write('ENVIE PERGUNTAS UTILIZANDO O TERMINAL DE COMANDO:');
            await this.write('', 0);

            this.enable = true;

        },
            
        sendCommand(command) {

            switch(command.question) {

                case '/CLEAR':
                    this.output = [];
                break;

                case '/HELP':
                    this.help();
                break;

                case '/ABOUT':
                    this.about();
                break;

                default:
                    this.showAnswer(command);

            }


        },

        async help() {

            this.enable = false;
        
            await this.write('', 0);
            await this.write('', 0);
            await this.write('CARREGANDO AJUDA...', 0);
            await this.write('VOCÊ PODE ME CONTAR SEGREDINHOS TECLANDO [ESPAÇO].');
            await this.write('AJUDA FINALIZADA <<<');

            this.enable = true;

        },

        async about() {

            this.enable = false;
        
            await this.write('', 0);
            await this.write('', 0);
            await this.write('DESENVOLVIDO POR: DIEGO MARQUES', 0);
            await this.write('<a href="https://diegomarques.com.br" title="Visite: https://diegomarques.com.br" target="_blank">HTTPS://DIEGOMARQUES.COM.BR</a>', 0);

            this.enable = true;

        },

        async showAnswer(command) {

            this.enable = false;

            if(!command.answer)
                command.answer = 'NÃO SEI AO CERTO SOBRE ISSO... VOCÊ NÃO FEZ A PERGUNTA CORRETAMENTE.';
            
            if(this.output.length > 0) {
            
                await this.write('', 0);
                await this.write('', 0);

            }
            
            await this.write(`ENVIANDO PERGUNTA: [${command.question}]`, 0);
            await this.write('CALCULANDO...');

            for (let i = 0; i < ((Math.random() * ((command.answer.length / 2) - 1)) + 1); i++)
                await this.write('.');
                
            await this.write('CÁLCULO FINALIZADO <<<');
            await this.write('PREPARANDO RESPOSTA...', 10);

            await this.write('0% CONCLUÍDO', 10);
            for (let i = 1; i <= 100; i++)
                await this.write(`${i}% CONCLUÍDO`, 10, true);
                
            await this.write('', 0);
            await this.write(`RESPOSTA: [${command.answer}]`, 0);
                    
            this.enable = true;

        },

        write(text, timeout, update = false) {

            if(typeof timeout == 'undefined')
                timeout = (Math.random() * (2000 - 100)) + 100;

            return new Promise((resolve) => {
                
                setTimeout(() => {

                    if(update)
                        this.output[this.output.length - 1] = text;

                    else
                        this.output.push(text);

                    this.$nextTick(() => window.scrollTo(0, document.body.scrollHeight));
                    
                    resolve();

                }, timeout);

            });
            
        }

    }

}

</script>

<style lang="scss" module>

.terminal {

    display: block;

}

</style>