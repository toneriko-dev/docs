<script setup lang="ts">
// 検索は Pagefind の索引を使う。VitePress の組み込みの検索は語を空白で区切るため、日本語を引けない。
// 索引はビルドの後に作られるので、開発用のサーバーでは検索欄を出さない。
// トップページでは本文の大きな検索欄を使い、上の帯の検索欄は出さない。
import { useData, withBase } from 'vitepress';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps<{ hero?: boolean }>();
const { page } = useData();
const shown = computed(() => props.hero || page.value.relativePath !== 'index.md');

const ready = ref(false);
const query = ref('');
const results = ref<{ url: string; title: string; excerpt: string }[]>([]);
const active = ref(-1);
const input = ref<HTMLInputElement>();
// トップページでは検索欄が 2 つ置かれるので、結果の一覧の id を部品ごとに分ける
const listId = props.hero ? 'pf-results-hero' : 'pf-results-nav';
let pagefind: any = null;
let timer: ReturnType<typeof setTimeout> | undefined;

// 「/」で検索欄へ移る。トップページでは両方の部品が置かれるので、表示している方だけが受ける。
function onKey(e: KeyboardEvent) {
	if (e.key !== '/' || !shown.value || !input.value) return;
	const t = e.target as HTMLElement;
	if (t.closest('input, textarea, [contenteditable]')) return;
	e.preventDefault();
	input.value.focus();
}

onMounted(async () => {
	window.addEventListener('keydown', onKey);
	try {
		const path = withBase('/pagefind/pagefind.js');
		pagefind = await import(/* @vite-ignore */ path);
		await pagefind.init();
		ready.value = true;
	} catch {
		ready.value = false;
	}
});
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));

// 検索の世代。Esc や新しい入力のあとに、前の検索の結果が書き込まれないようにする。
let seq = 0;
// results がどの語の結果か。Enter のときに入力と合っていなければ、引き直してから移る。
let resultsFor = '';

function clear() {
	clearTimeout(timer);
	seq++;
	query.value = '';
	results.value = [];
	resultsFor = '';
	active.value = -1;
}

function move(step: number) {
	const n = results.value.length;
	if (!n) return;
	active.value = active.value < 0 ? (step > 0 ? 0 : n - 1) : (active.value + step + n) % n;
}

async function go(e: KeyboardEvent) {
	// IME の変換を確定する Enter では移らない
	if (e.isComposing || e.keyCode === 229) return;
	const q = query.value.trim();
	if (q !== resultsFor) {
		clearTimeout(timer);
		await run(q);
	}
	const r = results.value[Math.max(active.value, 0)];
	if (!r) return;
	clear();
	location.href = r.url;
}

async function run(q: string) {
	const mine = ++seq;
	if (!pagefind || !q) { results.value = []; resultsFor = q; return; }
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
	if (mine !== seq) return;
	results.value = list.slice(0, 8);
	resultsFor = q;
	active.value = -1;
}

function search() {
	clearTimeout(timer);
	seq++;
	timer = setTimeout(() => run(query.value.trim()), 120);
}
</script>

<template>
	<div v-if="ready && shown" class="pf" :class="{ hero }">
		<svg class="pf-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L20 20" /></svg>
		<input
			ref="input" v-model="query" class="pf-input" type="search" :placeholder="hero ? 'ページやエンドポイントを検索' : '検索'"
			aria-label="ドキュメントを検索" autocomplete="off"
			role="combobox" aria-autocomplete="list" :aria-expanded="results.length > 0" :aria-controls="listId"
			:aria-activedescendant="active >= 0 ? `${listId}-${active}` : undefined"
			@input="search" @keydown.down.prevent="move(1)" @keydown.up.prevent="move(-1)" @keydown.enter.prevent="go" @keydown.esc="clear"
		>
		<kbd class="pf-key" aria-hidden="true">/</kbd>
		<ul v-if="results.length" :id="listId" class="pf-results" role="listbox" aria-label="検索結果">
			<li v-for="(r, i) in results" :id="`${listId}-${i}`" :key="r.url" role="option" :aria-selected="i === active">
				<a :href="r.url" :class="{ active: i === active }" @click="clear">
					<strong>{{ r.title }}</strong>
					<span v-html="r.excerpt" />
				</a>
			</li>
		</ul>
	</div>
</template>

<style scoped>
.pf { position: relative; display: flex; align-items: center; margin: 0 13px 0 16px; }
.pf-icon {
	position: absolute; left: 10px; width: 16px; height: 16px; pointer-events: none;
	fill: none; stroke: var(--vp-c-text-3); stroke-width: 2; stroke-linecap: round;
}
.pf-input {
	width: 220px; height: 34px; padding: 0 30px 0 34px; border-radius: 4px;
	border: 1px solid var(--vp-c-border); background: var(--vp-c-bg); color: var(--vp-c-text-1); font-size: 14px; /* taste-skill-ignore: 入力欄の枠 */
	transition: border-color 0.15s;
}
.pf-input::placeholder { color: var(--vp-c-text-3); }
.pf-input:hover { border-color: var(--vp-c-text-3); }
.pf-input:focus-visible { outline: none; border-color: var(--vp-c-brand-1); box-shadow: 0 0 0 3px var(--vp-c-brand-soft); } /* taste-skill-ignore: 入力中だけ出る焦点の輪 */
.pf-input::-webkit-search-cancel-button { display: none; }
.pf-key {
	position: absolute; right: 8px; padding: 0 6px; border-radius: 3px; background: var(--vp-c-bg-soft);
	font-size: 13px; line-height: 18px; color: var(--vp-c-text-3); pointer-events: none;
}
.pf-input:focus ~ .pf-key { display: none; }

.hero { margin: 0; max-width: 34em; }
.hero .pf-icon { left: 16px; width: 20px; height: 20px; }
.hero .pf-input { width: 100%; height: 52px; padding: 0 44px 0 48px; font-size: 16px; background: var(--vp-c-bg-elv); }
.hero .pf-key { right: 14px; }

.pf-results {
	position: absolute; top: calc(100% + 8px); right: 0; width: min(520px, 90vw); max-height: 70vh; overflow-y: auto;
	margin: 0; padding: 5px; list-style: none; border-radius: 6px;
	background: var(--vp-c-bg-elv); box-shadow: var(--vp-shadow-3); z-index: 100; /* taste-skill-ignore: 検索結果は開いたときだけ浮く一覧 */
}
.hero .pf-results { left: 0; right: auto; width: 100%; }
.pf-results a { display: grid; gap: 2px; padding: 8px 13px; border-radius: 4px; border-left: 2px solid transparent; color: var(--vp-c-text-1); text-decoration: none; }
.pf-results a:hover, .pf-results a:focus-visible, .pf-results a.active { background: var(--vp-c-default-soft); border-left-color: var(--vp-c-brand-1); }
.pf-results strong { color: var(--tk-fg-strong); font-weight: 500; }
.pf-results span { font-size: 13px; line-height: 1.7; color: var(--vp-c-text-2); }
.pf-results :deep(mark) { background: var(--vp-c-brand-soft); color: inherit; border-radius: 2px; }
@media (max-width: 768px) {
	.pf:not(.hero) .pf-input { width: 132px; }
	.pf-key { display: none; }
	.hero .pf-input { padding-right: 16px; }
}
/* 幅 320px でも、ロゴと検索欄とメニューのボタンを 1 行に収める */
@media (max-width: 420px) {
	.pf:not(.hero) { margin: 0 4px 0 8px; }
	.pf:not(.hero) .pf-input { width: 96px; }
}
</style>
