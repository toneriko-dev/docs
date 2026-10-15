<script setup lang="ts">
import { icons } from './icons';

defineProps<{ name: string }>();
</script>

<template>
	<!-- eslint-disable-next-line vue/no-v-html -->
	<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" v-html="icons[name]" />
</template>

<style scoped>
.ui-icon { width: 1.15em; height: 1.15em; flex: none; }
</style>
