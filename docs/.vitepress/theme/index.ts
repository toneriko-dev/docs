import DefaultTheme from 'vitepress/theme';
import { h } from 'vue';
import PagefindSearch from './PagefindSearch.vue';
import './style.css';

export default {
	extends: DefaultTheme,
	Layout: () => h(DefaultTheme.Layout, null, { 'nav-bar-content-before': () => h(PagefindSearch) }),
};
