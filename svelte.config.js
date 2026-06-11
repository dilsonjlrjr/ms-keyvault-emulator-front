import adapter from '@sveltejs/adapter-node';
import { execSync } from 'node:child_process';

const sha = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter(),
		csrf: { checkOrigin: false },
		version: { name: sha }
	},
	vite: {
		define: {
			__APP_VERSION__: JSON.stringify(sha)
		}
	}
};

export default config;
