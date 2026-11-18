<template>
    <ul :class="$style.output">

        <li
            v-for="(line, index) in lines"
            :key="index"
            :class="$style.line"
            v-html="line || '&nbsp;'"
        >
        </li>

    </ul>
</template>

<script setup lang="ts">
defineProps<{ lines: string[] }>()
</script>

<style module>

.output {

    display: block;
    margin: 0;
    padding: 2rem 0 0 0;

}

.line {

    list-style: none;
    overflow: hidden;
    overflow-wrap: break-word;
    padding: 0 2rem;
    word-wrap: break-word;
    white-space: pre-wrap;

}

</style>
