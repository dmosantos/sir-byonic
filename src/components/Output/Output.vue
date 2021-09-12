<template>
    <ul :class="$style.output">

        <li v-if="lines.length == 0">&nbsp;</li>
        <li
            v-for="(line, index) in lines"
            :key="index"
            :class="$style.line"
            v-html="line || '&nbsp;'"
        >
        </li>

    </ul>
</template>

<script>

export default {

    name: 'Output',

    props: {

        lines: Array

    }

}

</script>

<style lang="scss" module>

.output {

    display: block;
    margin: 0;
    padding: 1rem 0;

}

.line {

    list-style: none;
    padding: 0 2rem;
    word-wrap: break-word;
    word-break: break-all;

}

</style>