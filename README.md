# Toneriko のドキュメント

[Toneriko](https://github.com/toneriko-dev/toneriko) の使い方・運用・API の説明のサイトです。VitePress で作り、検索は Pagefind を使っています。main に push すると GitHub Pages に出ます。

```sh
bun install
bun run dev      # 開発用のサーバー(検索はビルドの後でだけ動く)
bun run build    # ビルドと検索の索引
bun run preview
```

API のページは、本体の API 定義(`data/api.json`)から生成しています。本体の版を上げるときは、本体の clone で `bun run build-misskey-js-with-types` を流してから、次のコマンドで写します。写した本体のコミットは `toneriko.ref` に残ります。

```sh
bun run update-api ../toneriko
```
