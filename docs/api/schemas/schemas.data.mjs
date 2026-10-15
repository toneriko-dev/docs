import { schemas } from '../../.vitepress/api.mjs';

export default {
	load() {
		return Object.keys(schemas).sort();
	},
};
