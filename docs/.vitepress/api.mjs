// 本体の OpenAPI(data/api.json)から、エンドポイントとスキーマのページの Markdown と、サイドバーを作る。
// ページはビルドのときに静的な Markdown として出すので、JSON をブラウザに配らず、検索の索引にも入る。
import { readFileSync } from 'node:fs';

const spec = JSON.parse(readFileSync(new URL('../../data/api.json', import.meta.url), 'utf8'));
export const tonerikoRef = readFileSync(new URL('../../toneriko.ref', import.meta.url), 'utf8').trim();

// 分類の表示名。OpenAPI のタグ名をそのまま使い、よく使う分類から並べる。
const TAG_ORDER = ['notes', 'account', 'users', 'following', 'drive', 'notifications', 'channels', 'antennas', 'clips', 'chat', 'pages', 'flash', 'gallery', 'reactions', 'meta', 'federation', 'auth', 'app', 'charts', 'admin'];

export const endpoints = Object.entries(spec.paths).map(([path, methods]) => {
	const op = methods.post ?? Object.values(methods)[0];
	return { name: path.slice(1), methods: Object.keys(methods).map(m => m.toUpperCase()), op, tag: op.tags?.[0] ?? 'other' };
}).sort((a, b) => a.name.localeCompare(b.name));

export const schemas = spec.components?.schemas ?? {};

function tagRank(tag) {
	const i = TAG_ORDER.indexOf(tag);
	return i < 0 ? TAG_ORDER.length : i;
}

export function endpointGroups() {
	const groups = new Map();
	for (const e of endpoints) {
		if (!groups.has(e.tag)) groups.set(e.tag, []);
		groups.get(e.tag).push(e);
	}
	return [...groups.entries()].sort(([a], [b]) => tagRank(a) - tagRank(b) || a.localeCompare(b));
}

export function apiSidebar() {
	return [
		{ text: 'API', items: [{ text: 'はじめに', link: '/api/' }, { text: 'スキーマ', link: '/api/schemas/' }] },
		...endpointGroups().map(([tag, list]) => ({
			text: `${tag} (${list.length})`,
			collapsed: true,
			items: list.map(e => ({ text: e.name, link: `/api/endpoints/${e.name}` })),
		})),
	];
}

const cell = s => String(s).replaceAll('|', '\\|').replaceAll('\n', ' ');

function refName(ref) {
	return ref.replace('#/components/schemas/', '');
}

// スキーマを 1 行の型の表記にする。参照はスキーマのページへのリンクにする。
export function typeOf(schema) {
	if (!schema) return 'any';
	if (schema.$ref) {
		const name = refName(schema.$ref);
		return `[${name}](/api/schemas/${name})`;
	}
	if (schema.anyOf || schema.oneOf) return (schema.anyOf ?? schema.oneOf).map(typeOf).join(' \\| ');
	if (schema.allOf) return schema.allOf.map(typeOf).join(' & ');
	if (schema.type === 'array') return `${typeOf(schema.items)}[]`;
	if (Array.isArray(schema.type)) return schema.type.join(' \\| ');
	if (schema.enum) return `\`${schema.enum.map(v => JSON.stringify(v)).join(' \\| ')}\``;
	if (schema.const !== undefined) return `\`${JSON.stringify(schema.const)}\``;
	return schema.format ? `${schema.type} (${schema.format})` : (schema.type ?? 'any');
}

function constraints(schema) {
	const s = schema.anyOf?.find(x => x.type !== 'null') ?? schema;
	const out = [];
	if (s.minLength !== undefined) out.push(`${s.minLength} 文字以上`);
	if (s.maxLength !== undefined) out.push(`${s.maxLength} 文字以下`);
	if (s.minimum !== undefined) out.push(`${s.minimum} 以上`);
	if (s.maximum !== undefined) out.push(`${s.maximum} 以下`);
	if (s.minItems !== undefined) out.push(`${s.minItems} 件以上`);
	if (s.maxItems !== undefined) out.push(`${s.maxItems} 件以下`);
	if (s.uniqueItems) out.push('重複なし');
	if (s.pattern) out.push(`\`${s.pattern}\``);
	if (schema.default !== undefined) out.push(`デフォルト \`${JSON.stringify(schema.default)}\``);
	return out.join('、');
}

// オブジェクトのプロパティを表の行にする。入れ子のオブジェクトは 2 段までドット区切りの名前で並べる。
function rows(schema, prefix = '', depth = 0) {
	const out = [];
	const required = new Set(schema.required ?? []);
	for (const [name, prop] of Object.entries(schema.properties ?? {})) {
		const full = prefix + name;
		const notes = [constraints(prop), prop.description ?? ''].filter(Boolean).join('。');
		out.push(`| \`${full}\`${required.has(name) ? ' <span class="required">必須</span>' : ''} | ${typeOf(prop)} | ${cell(notes)} |`);
		if (prop.type === 'object' && prop.properties && depth < 1) out.push(...rows(prop, `${full}.`, depth + 1));
	}
	return out;
}

function table(schema) {
	if (!schema?.properties || Object.keys(schema.properties).length === 0) return '引数はありません。';
	return ['| 名前 | 型 | 条件と説明 |', '| --- | --- | --- |', ...rows(schema)].join('\n');
}

// 本体が説明の文に埋め込む認証と権限を取り出す。説明が空のときの定型文は落とす。
function describe(op) {
	const text = op.description ?? '';
	const credential = /\*\*Credential required\*\*: \*Yes\*/.test(text);
	const permission = text.match(/\*\*Permission\*\*: \*([^*]+)\*/)?.[1] ?? null;
	const internal = text.includes('**Internal Endpoint**');
	const body = text.split('\n\n')[0];
	return { credential, permission, internal, summary: body.startsWith('No description provided') ? null : body };
}

export function endpointPage(e) {
	const { credential, permission, internal, summary } = describe(e.op);
	const request = e.op.requestBody?.content?.['application/json']?.schema;
	const ok = e.op.responses?.['200']?.content?.['application/json']?.schema;
	const noContent = e.op.responses?.['204'];
	const errors = Object.entries(e.op.responses ?? {}).filter(([status]) => status !== '200' && status !== '204')
		.flatMap(([status, res]) => Object.values(res.content?.['application/json']?.examples ?? {}).map(x => ({ status, ...x.value.error })));
	const source = e.op.externalDocs?.url;
	const lines = [
		`# ${e.name}`,
		'',
		`<div class="endpoint-meta"><span class="method">${e.methods.join(' / ')}</span><code>/api/${e.name}</code></div>`,
		'',
		'::: v-pre',
		summary ?? '説明はまだありません。',
		'',
		'| 項目 | 内容 |',
		'| --- | --- |',
		`| 認証 | ${credential ? '要る' : '要らない'} |`,
		`| 権限 | ${permission ? `\`${permission}\`` : 'なし'} |`,
		...(internal ? ['| 用途 | Web クライアント専用。外部のアプリからの利用は想定していない |'] : []),
		...(source ? [`| 定義 | [${source.split('/').pop()}](${source}) |`] : []),
		'',
		'## 引数',
		'',
		table(request),
		'',
		'## 応答',
		'',
		ok ? `\`200\`: ${typeOf(ok)}` : noContent ? '`204`: 本文なし' : '本文なし',
		...(ok?.type === 'object' && ok.properties ? ['', table(ok)] : []),
		'',
		'## エラー',
		'',
		...(errors.length ? ['| HTTP | コード | メッセージ | ID |', '| --- | --- | --- | --- |', ...errors.map(x => `| ${x.status} | \`${x.code}\` | ${cell(x.message)} | \`${x.id}\` |`)] : ['このエンドポイントに固有のエラーはありません。']),
		':::',
		'',
	];
	return lines.join('\n');
}

export function schemaPage(name) {
	const schema = schemas[name];
	return [
		`# ${name}`,
		'',
		'::: v-pre',
		schema.type === 'object' ? table(schema) : `型: ${typeOf(schema)}`,
		':::',
		'',
	].join('\n');
}
