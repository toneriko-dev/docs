import { schemas, schemaPage } from '../../.vitepress/api.mjs';

export default {
	paths() {
		return Object.keys(schemas).map(name => ({ params: { name }, content: schemaPage(name) }));
	},
};
