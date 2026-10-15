<script setup lang="ts">
// トップページ。最初の画面に本体の投稿フォームを置き、ボタンを押すとその説明のページが開くようにする。
// その下は、読む人ごとのページの一覧と、API のページの生成元。
import { useData, withBase } from 'vitepress';
import { computed, ref } from 'vue';
import PagefindSearch from './PagefindSearch.vue';
import UiFrame from './UiFrame.vue';

const { theme } = useData();
const tk = computed(() => theme.value.tk as { endpoints: number; schemas: number; ref: string });
const href = (link: string) => (link.startsWith('http') ? link : withBase(link));

// 読む人ごとのページの一覧。sections はそのページの見出し。link のないものは、これから書くページ。
type Page = { title: string; note: string; link?: string; sections?: string[] };
const readers: { name: string; pages: Page[] }[] = [
	{
		name: '使う人',
		pages: [
			{ title: 'はじめに', link: '/users/', note: '上限や初期値の読み方と、読む順番' },
			{ title: 'タイムライン', link: '/users/timelines', note: 'ノートが流れる 4 種類の場所と切り替え方', sections: ['リスト', 'アンテナ', 'チャンネル'] },
			{ title: 'ノートを書く', link: '/users/notes', note: '本文は 3,000 文字まで。公開範囲は 4 種類', sections: ['公開範囲', '注釈(CW)', 'アンケート', 'ファイルの添付', '予約投稿と下書き'] },
			{ title: 'リアクション', link: '/users/reactions', note: 'Unicode の絵文字とサーバーのカスタム絵文字' },
			{ title: 'ドライブ', link: '/users/drive', note: '自分のファイルの置き場所と容量', sections: ['容量', 'センシティブの指定'] },
			{ title: 'MFM', link: '/users/mfm', note: 'ノートの文字を飾る書き方' },
			{ title: 'アカウントの安全', link: '/users/security', note: '2 段階認証とパスキー' },
			{ title: 'データと引っ越し', link: '/users/moving', note: 'データの書き出しと、別のアカウントへの引っ越し' },
		],
	},
	{
		name: 'サーバーを立てる人',
		pages: [
			{ title: 'サーバーの運用', link: '/admin/', note: 'これから書くページの一覧' },
			{ title: '動作要件', note: 'Raspberry Pi 5 相当の環境で測ったメモリと CPU' },
			{ title: '導入', note: 'Docker Compose での導入から、動いていることの確認まで' },
			{ title: '設定の一覧', note: '.config の項目と環境変数' },
			{ title: 'バックアップと復旧', note: 'サーバーの移転、更新、廃止も' },
		],
	},
	{
		name: 'アプリを作る人',
		pages: [
			{ title: 'API のはじめに', link: '/api/', note: '/api/<名前> に JSON を POST して呼ぶ', sections: ['認証', 'エラー'] },
			{ title: 'スキーマ', link: '/api/schemas/', note: '応答に出てくる型の一覧' },
			{ title: 'Toneriko Script', link: 'https://github.com/toneriko-dev/toneriko-script', note: 'Play とプラグインで動くスクリプト言語' },
		],
	},
	{
		name: 'Misskey から来た人',
		pages: [
			{ title: 'Misskey との違い', link: '/compat/', note: 'プロトコルの識別子と公開 API の名前は Misskey のまま' },
		],
	},
];
const tab = ref(0);

// タブの並びの中は矢印キーと Home/End で移る (WAI-ARIA のタブの作法)
function onTabKey(e: KeyboardEvent) {
	const n = readers.length;
	const next = { ArrowRight: tab.value + 1, ArrowLeft: tab.value - 1 + n, Home: 0, End: n - 1 }[e.key];
	if (next === undefined) return;
	e.preventDefault();
	tab.value = next % n;
	document.getElementById(`reader-tab-${tab.value}`)?.focus();
}
</script>

<template>
	<div class="tk-home">
		<section class="intro" aria-labelledby="home-title">
			<div class="intro-text">
				<h1 id="home-title">Toneriko の<span class="nowrap">使い方と運用</span></h1>
				<p>フェディバースのサーバー Toneriko を使う人と、サーバーを立てる人に向けた説明です。</p>
				<div class="actions">
					<a class="button" :href="href('/users/')">はじめる</a>
					<PagefindSearch hero />
				</div>
			</div>
			<figure class="intro-ui">
				<UiFrame />
				<figcaption>投稿フォームのボタンを押すと、そのボタンの説明が開きます。</figcaption>
			</figure>
		</section>

		<section class="readers" aria-labelledby="readers-title">
			<h2 id="readers-title">読む人ごとのページ</h2>
			<div class="tabs" role="tablist" aria-label="読む人">
				<button
					v-for="(r, i) in readers" :id="`reader-tab-${i}`" :key="r.name" role="tab" type="button" class="tab"
					:aria-selected="tab === i" :aria-controls="`reader-panel-${i}`" :tabindex="tab === i ? 0 : -1"
					@click="tab = i" @keydown="onTabKey"
				>
					{{ r.name }}
				</button>
			</div>
			<div
				v-for="(r, i) in readers" v-show="tab === i" :id="`reader-panel-${i}`" :key="r.name" role="tabpanel"
				:aria-labelledby="`reader-tab-${i}`" class="rows"
			>
				<component :is="p.link ? 'a' : 'div'" v-for="p in r.pages" :key="p.title" class="row" :href="p.link ? href(p.link) : undefined">
					<strong>{{ p.title }}</strong>
					<span class="note">{{ p.note }}</span>
					<span class="extra">{{ p.link ? (p.sections ?? []).join('・') : 'これから書きます' }}</span>
				</component>
			</div>
		</section>

		<section class="about" aria-labelledby="about-title">
			<figure>
				<img :src="href('/photos/samaras.webp')" alt="枝から房になって下がるトネリコの翼果" width="1920" height="1440" loading="lazy">
				<figcaption>トネリコの翼果。<a href="https://commons.wikimedia.org/w/index.php?curid=2946140">KENPEI</a>、<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a></figcaption>
			</figure>
			<div class="about-text">
				<h2 id="about-title">このドキュメントについて</h2>
				<p>Toneriko は Misskey から分かれたフェディバースのサーバーです。名前は、モクセイ科の木トネリコ (Fraxinus japonica) から取っています。</p>
				<p>API のページは本体の API の定義から作っていて、いまは {{ tk.endpoints }} のエンドポイントと {{ tk.schemas }} のスキーマがあります。元にしたのは本体の <a :href="`https://github.com/toneriko-dev/toneriko/tree/${tk.ref}`">{{ tk.ref.slice(0, 10) }}</a> です。間違いを見つけたら、各ページの下の「このページを直す」から直せます。</p>
			</div>
		</section>
	</div>
</template>

<style scoped>
/* 余白は左右 32px (スマホ 16px)、区画の間は 96px、角は 4px */
.tk-home { --gutter: 32px; max-width: 1152px; margin: 0 auto; padding: 0 var(--gutter) 96px; color: var(--tk-fg-strong); }
.tk-home h2 { margin: 0; font-size: 1.618rem; line-height: 1.4; font-weight: 700; letter-spacing: 0.02em; }

.intro { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 440px); align-items: center; gap: 56px; padding: 96px 0 0; }
.intro h1 { margin: 0; font-size: clamp(2rem, 1.4rem + 2vw, 2.75rem); line-height: 1.4; font-weight: 700; letter-spacing: 0.02em; }
.intro-text p { margin: 16px 0 28px; max-width: 30em; font-size: 1.128rem; line-height: 1.8; color: var(--vp-c-text-1); }
.actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.button {
	display: inline-flex; align-items: center; height: 46px; padding: 0 24px; border-radius: 4px;
	background: var(--vp-c-brand-1); color: var(--tk-fg-on-brand) !important; font-weight: 700; text-decoration: none;
}
.button:hover { background: var(--vp-c-brand-2); }
.actions :deep(.pf.hero) { flex: 1; min-width: 14em; max-width: 22em; }
.actions :deep(.pf.hero .pf-input) { height: 46px; }
.nowrap { display: inline-block; }
.intro-ui { margin: 0; padding: 16px; border-radius: 6px; background: var(--vp-c-bg-soft); }
.intro-ui figcaption { margin-top: 10px; font-size: 0.875rem; color: var(--vp-c-text-2); }

.readers { padding-top: 96px; }
.tabs { display: flex; flex-wrap: wrap; gap: 6px; margin: 21px 0 13px; }
.tab {
	height: 38px; padding: 0 16px; border-radius: 4px; background: var(--vp-c-bg-alt);
	font-size: 0.94rem; font-weight: 500; color: var(--vp-c-text-1); cursor: pointer;
}
.tab:hover { background: var(--vp-c-bg-soft); }
.tab[aria-selected='true'] { background: var(--vp-c-brand-soft); color: var(--vp-c-brand-1); font-weight: 700; }
.rows { display: grid; gap: 2px; }
.row {
	display: grid; grid-template-columns: 11em minmax(0, 1fr) minmax(0, 0.8fr); align-items: baseline; gap: 21px;
	padding: 13px 16px; border-radius: 4px; text-decoration: none; color: var(--tk-fg-strong);
}
.row:nth-child(odd) { background: var(--vp-c-bg-alt); }
a.row:hover strong { color: var(--vp-c-brand-1); }
.row strong { font-weight: 700; }
.row .note { color: var(--vp-c-text-1); }
.row .extra { font-size: 0.875rem; color: var(--vp-c-text-2); text-align: right; }
div.row strong { color: var(--vp-c-text-2); }

.about { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: 40px; align-items: start; padding-top: 96px; }
.about figure { margin: 0; }
.about img { display: block; width: 100%; height: auto; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 4px; }
.about figcaption { margin-top: 8px; font-size: 0.875rem; color: var(--vp-c-text-2); }
.about a { text-decoration: underline; text-underline-offset: 3px; }
.about a:hover { color: var(--vp-c-brand-1); }
.about-text p { margin: 13px 0 0; line-height: 1.85; color: var(--vp-c-text-1); }

@media (max-width: 960px) {
	.intro { grid-template-columns: minmax(0, 1fr); gap: 34px; padding-top: 56px; }
	.about { grid-template-columns: minmax(0, 1fr); }
	.about-text { order: -1; }
}
@media (max-width: 640px) {
	.tk-home { --gutter: 16px; }
	.readers, .about { padding-top: 72px; }
	.intro-ui { padding: 8px; }
	.actions :deep(.pf.hero) { flex-basis: 100%; max-width: none; min-width: 0; }
	.row { grid-template-columns: 1fr; gap: 2px; }
	.row .extra { text-align: left; }
}
</style>
