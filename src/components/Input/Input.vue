<template>
    <div>
        
        <div :class="$style.input">
            
            <div :class="$style.inputPwd">
                {{ enable ? pwd : '' }}
            </div>

            <span ref="char" :class="$style.charRef">X</span>

            <div
                ref="field"
                :class="$style.inputField"
                v-html="computedQuestion"
            ></div>

            <input
                ref="hiddenInput"
                :class="$style.hiddenInput"
                type="text"
                @input="focusHiddenInput"
                @blur="focusHiddenInput"
                autofocus
            />

        </div>

        <div
            :class="$style.overlay"
            @click="focusHiddenInput"
        />
        
        <!-- <ul>
            <li>caretPosition: {{ caretPosition }}</li>
            <li>command: {{ command }}</li>
            <li>answering: {{ answering }}</li>
            <li>selectedSausage: {{ selectedSausage }}</li>
        </ul> -->
        
    </div>
</template>

<script>

import { useKeypress } from 'vue3-keypress';

export default {

    name: 'Input',

    props: {

        enable: {
            type: Boolean,
            default: true
        },
        write: String

    },

    data() {
        return {

            pwd: '',
            caretPosition: 0,
            command: {
                question: '',
                answer: ''
            },
            answering: false,
            selectedSausage: 0,
            sausages: this.shuffleSausages(),
            sausageCharPos: 0

        }
    },

    computed: {

        computedQuestion() {

            let question;
            let caretPosition;

            if (this.$props.enable) {
                
                question = this.command.question || '';
                caretPosition = this.caretPosition;

            }

            else {

                question = this.$props.write || '';
                caretPosition = question.length;

            }

            return (
                question.slice(0, caretPosition) +
                `<span></span>` +
                question.slice(caretPosition, question.length)
            ).replace(/ /g, '&nbsp;');

        }

    },

    created() {

        useKeypress({
            keyEvent: "keydown",
            keyBinds: [],
            onAnyKey: this.onKeyPress
        });

    },

    methods: {

        onKeyPress({ event }) {

            // console.log(event.key);

            if(!this.$props.enable)
                return;

            let question = this.command.question || '';
            let character = event.key;
            let newCaretPosition = this.caretPosition;

            switch(character) {
                
                case 'Enter':

                    event.preventDefault();
                    
                    if(this.answering)
                        this.answering = false;
                    
                    else {
                        
                        this.sendCommand();
                        return;

                    }

                break;

                case 'Escape':

                    event.preventDefault();
                    this.cancel();
                    return;

                case 'ArrowLeft':

                    event.preventDefault();
                    newCaretPosition--;
                    this.answering = false;

                break;

                case 'ArrowRight':

                    event.preventDefault();
                    newCaretPosition++;
                    this.answering = false;

                break;

                case 'ArrowUp':
                case 'ArrowDown':
                    {
                
                        event.preventDefault();

                        var computedStyle = getComputedStyle(this.$refs.field);
                        let fieldWidth = this.$refs.field.clientWidth;
                        fieldWidth -= parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
                        let charWidth = this.$refs.char.clientWidth;
                        let charCount = Math.ceil(fieldWidth / charWidth) + 1;

                        newCaretPosition = character == 'ArrowUp'
                            ? this.caretPosition - charCount + 2
                            : this.caretPosition + charCount - 2;

                        this.answering = false;
                    
                    }
                break;

                case 'Home':

                    event.preventDefault();
                    newCaretPosition = 0;
                    this.answering = false;

                break;

                case 'End':

                    event.preventDefault();
                    newCaretPosition = question.length;
                    this.answering = false;

                break;

                case 'Delete':
                    
                    event.preventDefault();
                    this.command.question = question.substring(0, this.caretPosition) + question.substring(this.caretPosition + 1);
                    this.answering = false;
                
                break;

                case 'Backspace':
                
                    event.preventDefault();
                    this.command.question = question.substring(0, this.caretPosition - 1) + question.substring(this.caretPosition);
                    newCaretPosition--;
                    this.answering = false;

                break;

                case '<':
                case '>':
                    event.preventDefault();
                    return;

            }

            if(this.caretPosition != newCaretPosition)
                this.caretPosition = newCaretPosition <= 0
                    ? 0
                    : newCaretPosition >= question.length
                        ? question.length
                        : newCaretPosition;

            if(!character || character.length != 1)
                return;

            if(question == '' && character == ' ') {
                
                this.answering = true;
                this.command.answer = '';
                this.selectedSausage = 0;
                character = '';

            }

            if(this.answering) {

                if(this.sausages[this.selectedSausage].length <= this.sausageCharPos) {
                    
                    this.selectedSausage = this.selectedSausage + 1 == this.sausages.length ? 0 : this.selectedSausage + 1;
                    this.sausageCharPos = 0;

                }

                this.command.answer += character.toUpperCase();
                character = this.sausages[this.selectedSausage][this.sausageCharPos];
                this.sausageCharPos++;

            }

            this.command.question = question.substring(0, this.caretPosition) + character.toUpperCase() + question.substring(this.caretPosition);
            
            this.caretPosition++;

            window.scrollTo(0, document.body.scrollHeight);

        },

        shuffleSausages() {

            const shuffleArray = arr => arr.sort(() => Math.random() - 0.5);

            return shuffleArray([
                'Querida máquina pensante, ',
                'Grande ser dotado de inteligência ilimitada, ',
                'Meu querido computador, ',
                'Excelentíssimo circuito integrado, ',
                'Venho por meio desta, ',
                'Por favor minha querida máquina calculante, ',
                'Gostaria que me respondesse, ',
                'Com toda sua sabedoria, ',
            ]);

        },

        cancel() {

            this.caretPosition = 0;
            this.command = {
                question: '',
                answer: ''
            },
            this.answering = false;
            this.selectedSausage = 0;
            this.sausageCharPos = 0;
            this.sausages = this.shuffleSausages();

        },

        sendCommand() {

            if(!this.command.question)
                return;

            this.$emit('sendCommand', this.command);

            this.cancel();

        },

        focusHiddenInput() {

            this.$refs.hiddenInput.value = '';
            this.$refs.hiddenInput.focus();

        }

    }

}

</script>

<style lang="scss" module>

.input {

    align-items: flex-start;
    display: flex;

    &__pwd {

        padding: 0 0 2rem 2rem;
        white-space: nowrap;

    }

    &__field {
        
        flex-grow: 1;
        padding: 0 1rem 2rem 0;
        word-wrap: break-word;
        word-break: break-all;

        span {

            animation: cursor .2s linear infinite alternate;
            border-radius: 2px;
            content: '';
            background-color: var(--primary-text-color);
            display: inline-block;
            height: 1em;
            margin-left: -.05em;
            margin-right: -.65em;
            vertical-align: top;
            width: .7em;

        }

    }

}

@keyframes cursor {

    0% {

        box-shadow: 0px 0px 3px 0px var(--color-4), 0px 0px 5px 0px var(--color-1), 0px 0px 3px 0px var(--color-4);
        opacity: 1;
        

    }
    70% {

        box-shadow: 0px 0px 3px 0px var(--color-4), 0px 0px 5px 0px var(--color-1), 0px 0px 3px 0px var(--color-4);
        opacity: 1;

    }
    75% {

        box-shadow: 0px 0px 5px 0px var(--color-4), 0px 0px 5px 0px var(--color-1), 0px 0px 5px 0px var(--color-4);
        opacity: .1;

    }
    100% {

        box-shadow: 0px 0px 5px 0px var(--color-4), 0px 0px 5px 0px var(--color-1), 0px 0px 5px 0px var(--color-4);
        opacity: .1;

    }

}

.char-ref {

    bottom: 100%;
    display: inline-block;
    opacity: 0;
    position: absolute;
    right: 100%;

}

.hidden-input {

    border: 0 none;
    height: 0;
    padding: 0;
    width: 0;

}

.overlay {
    
    background-color: transparent;
    left: 0;
    height: 100%;
    position: fixed;
    top: 0;
    width: 100%;

}

</style>