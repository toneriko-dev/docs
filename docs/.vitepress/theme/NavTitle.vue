<script setup lang="ts">
// 上の帯の左端。葉とワードマークに「docs」を添える。ワードマークは文字の色に従う。
import TkMark from './TkMark.vue';
</script>

<template>
	<span class="tk-title">
		<TkMark id="nav" class="tk-title-mark" />
		<svg class="tk-title-word" viewBox="0 0 488 136" role="img" aria-label="Toneriko">
			<g fill="none" stroke="currentColor" stroke-width="13" stroke-linecap="round" stroke-linejoin="round">
				<path d="M24 22V84Q24 100 40 100M11 46H41" />
				<circle cx="92" cy="72" r="27" />
				<path d="M143 46V100M143 70A24 24 0 0 1 191 70V100" />
				<path d="M269 72A27 27 0 1 0 259.4 92.7M215 72H269" />
				<path d="M293 46V100M293 73C293 56 301 46 318 46" />
				<path d="M342 46V100" />
				<path d="M366 22V100M396 46L366 78M378 66L398 100" />
				<circle cx="449" cy="72" r="27" />
			</g>
			<circle cx="342" cy="23" r="7.5" class="tk-title-dot" />
		</svg>
		<span class="tk-title-docs">ドキュメント</span>
	</span>
</template>

<style scoped>
.tk-title { display: inline-flex; align-items: center; gap: 8px; color: var(--tk-fg-strong); }
.tk-title-mark { width: 21px; height: 24px; color: var(--vp-c-brand-1); }
.tk-title-word { height: 21px; width: auto; }
.tk-title-dot { fill: var(--vp-c-brand-1); }
.tk-title-docs { margin-left: 3px; font-size: 14px; font-weight: 500; color: var(--vp-c-text-2); }
/* 狭い画面では上の帯に検索欄が並ぶので、添え字を外す */
@media (max-width: 520px) { .tk-title-docs { display: none; } }
</style>
