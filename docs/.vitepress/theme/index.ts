import '@fontsource/ibm-plex-sans-jp/400.css';
import '@fontsource/ibm-plex-sans-jp/500.css';
import '@fontsource/ibm-plex-sans-jp/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import DefaultTheme from 'vitepress/theme';
import { h } from 'vue';
import Home from './Home.vue';
import NavTitle from './NavTitle.vue';
import PagefindSearch from './PagefindSearch.vue';
import './style.css';

export default {
	extends: DefaultTheme,
	Layout: () => h(DefaultTheme.Layout, null, {
		'nav-bar-title-before': () => h(NavTitle),
		'nav-bar-content-before': () => h(PagefindSearch),
	}),
	enhanceApp({ app }) {
		app.component('TkHome', Home);
	},
};
