<script setup lang="ts">
// 本体の投稿フォームを、本物と同じ表示名とアイコンで描く。ボタンはそれぞれ、その説明のページへのリンクになっている。
// 表示名は本体の locales/ja-JP.yml、アイコンは MkPostForm.vue と同じ Tabler Icons のもの。
import { withBase } from 'vitepress';
import UiIcon from './UiIcon.vue';

const go = (path: string) => withBase(path);

// hide は、狭い画面で外すボタン。下段を 1 行に収めるため。
const tools: { icon: string; label: string; to: string; hide?: 'narrow' | 'narrower' }[] = [
	{ icon: 'photo-plus', label: 'ファイルを添付 (アップロード)', to: '/users/notes#ファイルの添付' },
	{ icon: 'cloud-download', label: 'ファイルを添付 (ドライブから)', to: '/users/drive', hide: 'narrow' },
	{ icon: 'chart-arrows', label: 'アンケート', to: '/users/notes#アンケート' },
	{ icon: 'eye-off', label: '内容を隠す', to: '/users/notes#注釈-cw' },
	{ icon: 'hash', label: 'ハッシュタグ', to: '/users/mfm#リンクとメンション', hide: 'narrower' },
	{ icon: 'at', label: 'メンション', to: '/users/mfm#リンクとメンション', hide: 'narrower' },
	{ icon: 'palette', label: '装飾を追加', to: '/users/mfm' },
];
</script>

<template>
	<div class="ui" data-ui>
		<div class="head">
			<span class="avatar" aria-hidden="true" />
			<span class="who">@docs</span>
			<a class="btn tip-end" :href="go('/users/notes#公開範囲')" data-tip="公開範囲" aria-label="公開範囲"><UiIcon name="world" /></a>
			<a class="btn tip-end" :href="go('/users/notes#公開範囲')" data-tip="連合なし" aria-label="連合なし"><UiIcon name="rocket" /></a>
			<a class="btn tip-end" :href="go('/users/notes#予約投稿と下書き')" data-tip="下書きと予約投稿" aria-label="下書きと予約投稿"><UiIcon name="calendar-time" /></a>
		</div>
		<div class="text">いまどうしてる？</div>
		<div class="foot">
			<a v-for="t in tools" :key="t.label" class="btn tip-start" :class="t.hide" :href="go(t.to)" :data-tip="t.label" :aria-label="t.label"><UiIcon :name="t.icon" /></a>
			<a class="btn emoji tip-end" :href="go('/users/reactions')" data-tip="絵文字" aria-label="絵文字"><UiIcon name="mood-happy" /></a>
			<a class="submit" :href="go('/users/notes')">ノート<UiIcon name="send" /></a>
		</div>
	</div>
</template>

<style scoped>
/* 本体の UI の寸法 (文字 14〜15px、角 6px、操作 34px 角) をそのまま使う */
.ui {
	display: grid; grid-template-rows: auto 1fr auto; gap: 8px; padding: 13px 16px;
	background: var(--vp-c-bg-elv); color: var(--vp-c-text-2); font-size: 14px; line-height: 1.5; border-radius: 6px;
}
.ui a { color: inherit; text-decoration: none; }
.avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--vp-c-brand-1); flex: none; }
.btn {
	position: relative; display: inline-flex; align-items: center; justify-content: center;
	width: 34px; height: 34px; border-radius: 6px; font-size: 15px; transition: background-color 0.12s, color 0.12s;
}
.btn:hover, .btn:focus-visible { background: var(--vp-c-default-soft); color: var(--vp-c-brand-1); }
[data-tip]:hover::after, [data-tip]:focus-visible::after {
	content: attr(data-tip); position: absolute; left: 50%; bottom: calc(100% + 6px); transform: translateX(-50%); z-index: 2;
	padding: 3px 8px; border-radius: 4px; white-space: nowrap; font-size: 13px; line-height: 1.5;
	background: var(--tk-fg-strong); color: var(--vp-c-bg); pointer-events: none;
}
/* 端のボタンの説明は、枠の内側へ伸ばす */
.tip-start[data-tip]:hover::after, .tip-start[data-tip]:focus-visible::after { left: 0; transform: none; }
.tip-end[data-tip]:hover::after, .tip-end[data-tip]:focus-visible::after { left: auto; right: 0; transform: none; }
.head { display: flex; align-items: center; gap: 5px; }
.who { margin: 0 auto 0 5px; }
.text { min-height: 84px; padding: 5px 2px; font-size: 15px; color: var(--vp-c-text-3); }
.foot { display: flex; align-items: center; gap: 1px; }
.emoji { margin-left: auto; }
.submit {
	display: inline-flex; align-items: center; gap: 5px; height: 34px; padding: 0 13px; margin-left: 3px; border-radius: 6px; white-space: nowrap;
	background: var(--vp-c-brand-1); color: var(--tk-fg-on-brand) !important; font-weight: 700;
}
.submit:hover { background: var(--vp-c-brand-2); }
/* 狭い画面では、ボタンを減らして 1 行に収める */
@media (max-width: 480px) {
	.btn { width: 30px; }
	.narrow { display: none; }
}
@media (max-width: 380px) {
	.ui { padding: 13px 10px; }
	.narrower { display: none; }
}
</style>
