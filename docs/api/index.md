# API

Toneriko の API は、`/api/<エンドポイントの名前>` に JSON を POST して呼びます。一部のエンドポイントは GET も受けます。各エンドポイントのページは、本体の API の定義から生成しています。

## 認証

認証の要るエンドポイントには、アクセストークンを `Authorization` ヘッダーで渡します。

```sh
curl -X POST https://example.com/api/i \
  -H 'Authorization: Bearer <トークン>' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

権限(`write:notes` など)の要るエンドポイントでは、トークンにその権限が付いている必要があります。各ページの「権限」の欄に書いています。

## エラー

失敗したときは、HTTP の状態と一緒に次の形の JSON が返ります。`code` と `id` は版をまたいで変わらないので、プログラムからはこの 2 つで見分けます。

```json
{
	"error": {
		"code": "NO_SUCH_NOTE",
		"message": "No such note.",
		"id": "…",
		"kind": "client"
	}
}
```

## エンドポイント

左の一覧から選ぶか、上の検索で名前を引いてください。「Web クライアント専用」と書いたエンドポイントは、外部のアプリからの利用を想定していません。
