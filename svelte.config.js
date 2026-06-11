import adapter from '@sveltejs/adapter-node';
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function getSha(): string {
	try { return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim(); }
	catch { /* sem git — lê do arquivo */ }
	const versionFile = resolve(__dirname, '.version');
	if (existsSync(versionFile)) return readFileSync(versionFile, 'utf-8').trim();
	return 'unknown';
}

const sha = getSha();

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
