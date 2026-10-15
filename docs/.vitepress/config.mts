import { defineConfig } from 'vitepress';
import { apiSidebar, endpoints, tonerikoRef } from './api.mjs';

// GitHub Pages ではリポジトリの名前の下に置かれるので、ビルドのときに DOCS_BASE で場所を渡す。
export default defineConfig({
	base: process.env.DOCS_BASE ?? '/',
	lang: 'ja',
	title: 'Toneriko',
	description: 'Misskey から分かれたフェディバースのサーバー Toneriko のドキュメント',
	cleanUrls: true,
	lastUpdated: true,
	head: [['link', { rel: 'icon', href: `${process.env.DOCS_BASE ?? '/'}toneriko-icon.svg` }]],
	themeConfig: {
		logo: '/toneriko-icon.svg',
		nav: [
			{ text: '利用者', link: '/users/' },
			{ text: '管理者', link: '/admin/' },
			{ text: 'API', link: '/api/' },
			{ text: 'Misskey との違い', link: '/compat/' },
			{ text: '開発', link: '/dev/' },
		],
		sidebar: {
			'/api/': apiSidebar(),
		},
		socialLinks: [{ icon: 'github', link: 'https://github.com/toneriko-dev/toneriko' }],
		editLink: { pattern: 'https://github.com/toneriko-dev/docs/edit/main/docs/:path', text: 'このページを直す' },
		outline: { label: 'このページの内容', level: [2, 3] },
		docFooter: { prev: '前のページ', next: '次のページ' },
		lastUpdated: { text: '最後の更新' },
		returnToTopLabel: '上へ戻る',
		sidebarMenuLabel: 'メニュー',
		darkModeSwitchLabel: '外観',
		footer: {
			message: `API の説明は Toneriko <a href="https://github.com/toneriko-dev/toneriko/tree/${tonerikoRef}">${tonerikoRef.slice(0, 10)}</a> の定義から生成しています(${endpoints.length} エンドポイント)。`,
			copyright: 'Misskey © syuilo and misskey-project',
		},
	},
});
