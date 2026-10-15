<script setup lang="ts">
// 本体のアイコンの葉だけを、地の四角なしで描く。色は呼び出し側の color に従う。
// 葉脈はマスクで抜くので、ページの id と重ならないよう使う場所ごとに id を変える。
const props = defineProps<{ id: string }>();
const maskId = `tk-veins-${props.id}`;
</script>

<template>
	<svg viewBox="26 22 76 85" aria-hidden="true">
		<defs>
			<mask :id="maskId" maskUnits="userSpaceOnUse" x="0" y="0" width="128" height="128">
				<rect width="128" height="128" fill="#fff" />
				<g fill="none" stroke="#000" stroke-linecap="round">
					<path d="M45 86L83 48" stroke-width="8" />
					<path d="M57.2 73.8V56.8M64 67H81" stroke-width="7" />
				</g>
			</mask>
		</defs>
		<path d="M97 30C65 24 29 40 29 68C29 77 32 84 38 89L30 97L36 103L46 94C49 95 51 95 53 95C82 95 100 61 97 30Z" fill="currentColor" :mask="`url(#${maskId})`" />
	</svg>
</template>
