import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),

		// Ferramenta interna self-hosted, acessada por vários hostnames (lab-dilson,
		// FQDN do Tailscale, IP). O CSRF do SvelteKit só permite um único ORIGIN, e
		// rejeita (403) o POST de form quando o Origin do browser diverge — o que
		// quebrava silenciosamente a troca de vault e o create/delete de secrets.
		csrf: { checkOrigin: false }
	}
};

export default config;
