import adapter from '@sveltejs/adapter-node';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

function sha() {
	try { return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim(); }
	catch { /* sem git no build — lê .version */ }
	try { return readFileSync('.version', 'utf-8').trim(); }
	catch { return 'unknown'; }
}

const version = sha();

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter(),
		csrf: { checkOrigin: false },
		version: { name: version }
	},
	vite: {
		define: {
			__APP_VERSION__: JSON.stringify(version)
		}
	}
};

export default config;
