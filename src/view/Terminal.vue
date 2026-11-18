<script setup lang="ts">
import MainTemplate from './template/MainTemplate.vue'
import Output from '../components/Output/Output.vue'
import Input from '../components/Input/Input.vue'
import { useTerminal } from '../composables/useTerminal'

const { output, writeText, enable, sendCommand } = useTerminal()
</script>

<template>
  <MainTemplate>
    <Output :lines="output" />
    <Input :enable="enable" :write="writeText" @send-command="sendCommand" />
  </MainTemplate>
</template>
