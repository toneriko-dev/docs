import { endpoints, endpointPage } from '../../.vitepress/api.mjs';

export default {
	paths() {
		return endpoints.map(e => ({ params: { name: e.name }, content: endpointPage(e) }));
	},
};
