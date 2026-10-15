<script setup>
import { withBase } from 'vitepress'
import { data } from './schemas.data.mjs'
</script>

# スキーマ

エンドポイントの応答に出てくるオブジェクトの形です。

<ul>
	<li v-for="name in data" :key="name"><a :href="withBase(`/api/schemas/${name}`)">{{ name }}</a></li>
</ul>
