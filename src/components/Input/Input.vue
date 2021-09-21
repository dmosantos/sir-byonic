<template>
    <div :class="$style.input">

        <div
            :class="$style.container"
            @click="doFocus"
        >
        
            <div
                :class="$style.caret"
                :style="{ left: caretOffset[0] + 'px', top: caretOffset[1] + 'px' }"
            ></div>

            <textarea
                ref="field"
                :class="$style.field"
                :style="{ height: fieldHeight ? fieldHeight + 'px' : 'auto' }"
                :value="inputText"
                @input="onInput"
                @keydown="onChange"
                @keydown.esc.prevent="cancel"
                @keydown.enter.prevent="sendCommand"
                @keyup="onChange"
                @click="onChange"
                @focus="onChange"
                @blur="doFocus"
                type="text"
                rows="1"
                autofocus
            ></textarea>

        </div>

        <div
            :class="[$style.container, $style.mirror]"
            @click="doFocus"
        >
            
            <div
                ref="mirror"
                :class="$style.field"
            >{{ textStart }}<span ref="caret" :class="$style.caret" /></div>

        </div>

        <!-- <ul>
            <li>command: {{ command }}</li>
            <li>answering: {{ answering }}</li>
            <li>selectedSausage: {{ selectedSausage }}</li>
            <li>sausages: {{ sausages[selectedSausage] }}</li>
            <li>caretOffset: {{ caretOffset }}</li>
            <li>inputText: {{ inputText }}</li>
            <li>fieldHeight: {{ fieldHeight }}</li>
        </ul> -->
        
    </div>
</template>

<script>

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

            inputText: null,
            command: { question: '', answer: '' },
            answering: false,
            caretPosition: 0,
            caretOffset: [0, 0],
            fieldHeight: null,
            selectedSausage: 0,
            sausages: this.shuffleSausages(),
            sausageCharPos: 0

        }
    },

    computed: {

        textStart() {

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

            return question.slice(0, caretPosition);

        },

    },

    watch: {

        write(value) {

            this.inputText = value;
            this.updateCaretOffset();
            this.updateFieldHeight();

        },

        inputText(value) {

            this.command.question = (value || '').toUpperCase();
            this.updateCaretOffset();
            
        }

    },

    created() {

        window.addEventListener('focus', this.doFocus);

    },

    unmounted() {
        
        window.removeEventListener('focus', this.doFocus);

    },

    methods: {

        onInput(event) {

            event.preventDefault();

            let value = (event.target.value || '').toUpperCase();

            if(this.command.question == '' && value == ' ') {
                
                this.cancel();
                this.answering = true;
                this.command.answer = '';
                this.selectedSausage = 0;

            }

            if(this.answering) {

                if(value.length > (this.inputText || '').length) {

                    this.command.answer += value.substr(-1);

                    if(this.sausages[this.selectedSausage].length <= this.sausageCharPos) {
                        
                        this.selectedSausage = this.selectedSausage + 1 == this.sausages.length ? 0 : this.selectedSausage + 1;
                        this.sausageCharPos = 0;

                    }

                    let index = value.length - 1;
                    let newValue = this.sausages[this.selectedSausage][this.sausageCharPos];
                    
                    this.inputText = value.substr(0, index) + newValue + value.substr(index + newValue.length);
                    this.sausageCharPos++;

                } else {

                    this.command.answer = this.command.answer.slice(0, -1);
                    this.inputText = this.inputText.slice(0, -1);

                }

            }

            else
                this.inputText = value;

            this.onChange(event);

        },

        updateCaretOffset() {

            this.$nextTick(() => {

                if(this.$refs.caret)
                    this.caretOffset = [this.$refs.caret.offsetLeft, this.$refs.caret.offsetTop];

                else
                    this.caretOffset = [0, 0];

            });

            window.scrollTo(0, document.body.scrollHeight);

        },

        updateFieldHeight() {

            this.fieldHeight = this.$refs.field.scrollHeight;

        },

        onChange(event) {

            let el = event.target;
            let pos = 0;

            if ('selectionStart' in el)
                pos = el.selectionStart;
            
            else if ('selection' in document) {
                
                el.focus();
                let Sel = document.selection.createRange();
                let SelLength = document.selection.createRange().text.length;
                Sel.moveStart('character', -el.value.length);
                pos = Sel.text.length - SelLength;

            }

            this.caretPosition = pos;
            this.fieldHeight = el.scrollHeight;
            this.updateCaretOffset();

            if(!this.$props.enable)
                event.preventDefault();

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

            this.inputText = null;
            this.command = { question: '', answer: '' };
            this.answering = false;
            this.caretPosition = 0;
            this.caretOffset = [0, 0];
            this.fieldHeight = null;
            this.selectedSausage = 0;
            this.sausages = this.shuffleSausages();
            this.sausageCharPos = 0;

        },

        sendCommand() {

            if(!this.command.question)
                return;

            if(this.answering) {
                
                this.answering = false;
                this.command.answer = this.command.answer.trim();
                return;

            }

            this.command.question = this.command.question.trim();

            this.$emit('sendCommand', this.command);

            this.cancel();

        },

        doFocus() {

            this.$refs.field.focus();

        }

    }

}

</script>

<style lang="scss" module>

.input {

    margin: 0 2rem 2rem 2rem;
    position: relative;

}

.container {

    position: relative;

}

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
    text-shadow: 0px 0px 5px var(--color-4), 0px 0px 5px var(--color-1), 0px 0px 5px var(--color-4);
    width: 100%;
    word-wrap: break-word;
    white-space: pre-wrap;
    z-index: 5;

    &:focus {

        outline: none;

    }

}

.mirror {

    left: 0;
    opacity: 0;
    position: absolute;
    top: 0;
    z-index: 1;

}

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

</style>