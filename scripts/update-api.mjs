// 本体の API 定義(OpenAPI)を、手元の toneriko の clone から写し、そのコミットを toneriko.ref に記録する。
// api.json は本体のリポジトリでは追跡されず `bun run build-misskey-js-with-types` で生成されるので、
// 先に本体側でそのコマンドを流しておくこと。版を記録するのは、ドキュメントがどの版の説明かを示すため。
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const repo = process.argv[2];
if (!repo) throw new Error('使い方: bun scripts/update-api.mjs <toneriko の clone>');
const git = (...args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' }).trim();
const dirty = git('status', '--porcelain', '--', 'packages/backend/src');
if (dirty) throw new Error(`backend に未コミットの変更があります:\n${dirty}`);
const ref = git('rev-parse', 'HEAD');
await mkdir(new URL('../data/', import.meta.url), { recursive: true });
const spec = JSON.parse(await readFile(join(repo, 'packages/misskey-js/generator/api.json'), 'utf8'));
// servers には生成した環境の URL(手元の開発サーバー)が入るので、公開する前に外す。
delete spec.servers;
await writeFile(new URL('../data/api.json', import.meta.url), `${JSON.stringify(spec, null, '\t')}\n`);
await writeFile(new URL('../toneriko.ref', import.meta.url), `${ref}\n`);
console.log(`data/api.json を ${ref.slice(0, 10)} から写しました`);
