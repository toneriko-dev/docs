<script setup lang="ts">
// 検索は Pagefind の索引を使う。VitePress の組み込みの検索は語を空白で区切るため、日本語を引けない。
// 索引はビルドの後に作られるので、開発用のサーバーでは検索欄を出さない。
import { withBase } from 'vitepress';
import { onMounted, ref } from 'vue';

const ready = ref(false);
const query = ref('');
const results = ref<{ url: string; title: string; excerpt: string }[]>([]);
let pagefind: any = null;
let timer: ReturnType<typeof setTimeout> | undefined;

onMounted(async () => {
	try {
		const path = withBase('/pagefind/pagefind.js');
		pagefind = await import(/* @vite-ignore */ path);
		await pagefind.init();
		ready.value = true;
	} catch {
		ready.value = false;
	}
});

function search() {
	clearTimeout(timer);
	timer = setTimeout(async () => {
		if (!pagefind || !query.value.trim()) { results.value = []; return; }
		const q = query.value.trim();
		const found = await pagefind.search(q);
		const list = await Promise.all(found.results.slice(0, 8).map(async (r: any) => {
			const data = await r.data();
			// 見出しのアンカー用のゼロ幅スペースが題に残るので取り除く
			// Pagefind の URL は索引の置き場所を含むので、base を重ねない。cleanUrls に合わせて .html を外す。
			return { url: data.url.replace(/\.html$/, ''), title: data.meta.title.replace(/\u200b/g, '').trim(), excerpt: data.excerpt };
		}));
		// エンドポイントの名前で引いたときは、そのページを先頭に出す。Pagefind は notes/create を notes と create に分けて探すため。
		const exact = withBase(`/api/endpoints/${q}`);
		const hit = list.findIndex(r => r.url === exact);
		if (hit > 0) list.unshift(...list.splice(hit, 1));
		else if (hit < 0 && /^[a-z0-9-]+(\/[a-z0-9-]+)+$/.test(q) && (await fetch(exact, { method: 'HEAD' })).ok) list.unshift({ url: exact, title: q, excerpt: 'エンドポイント' });
		results.value = list.slice(0, 8);
	}, 120);
}
</script>

<template>
	<div v-if="ready" class="pf">
		<input v-model="query" class="pf-input" type="search" placeholder="検索" aria-label="ドキュメントを検索" @input="search">
		<ul v-if="results.length" class="pf-results">
			<li v-for="r in results" :key="r.url">
				<a :href="r.url" @click="query = ''; results = []">
					<strong>{{ r.title }}</strong>
					<span v-html="r.excerpt" />
				</a>
			</li>
		</ul>
	</div>
</template>

<style scoped>
.pf { position: relative; margin-right: 12px; }
.pf-input {
	width: 200px; height: 36px; padding: 0 12px; border-radius: 8px;
	border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg-alt); color: var(--vp-c-text-1); font-size: 14px;
}
.pf-input:focus-visible { outline: 2px solid var(--vp-c-brand-1); }
.pf-results {
	position: absolute; top: 44px; right: 0; width: min(480px, 90vw); max-height: 70vh; overflow-y: auto;
	margin: 0; padding: 6px; list-style: none; border: 1px solid var(--vp-c-divider); border-radius: 8px;
	background: var(--vp-c-bg-elv); box-shadow: var(--vp-shadow-3); z-index: 100;
}
.pf-results a { display: grid; gap: 2px; padding: 8px 10px; border-radius: 6px; color: var(--vp-c-text-1); }
.pf-results a:hover, .pf-results a:focus-visible { background: var(--vp-c-default-soft); }
.pf-results span { font-size: 13px; color: var(--vp-c-text-2); }
.pf-results :deep(mark) { background: var(--vp-c-brand-soft); color: inherit; }
@media (max-width: 768px) { .pf-input { width: 120px; } }
</style>
