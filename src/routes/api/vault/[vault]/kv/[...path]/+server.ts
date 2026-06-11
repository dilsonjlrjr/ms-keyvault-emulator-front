import { env } from '$env/dynamic/private';
import { Agent, fetch as undiciFetch } from 'undici';
import type { RequestHandler } from './$types';

const insecureAgent = new Agent({ connect: { rejectUnauthorized: false } });

function emulatorUrl(): string {
	const base = env.KEYVAULT_EMULATOR_URL;
	if (!base) throw new Error('KEYVAULT_EMULATOR_URL not set');
	return base.replace(/\/+$/, '');
}

export const GET: RequestHandler = async ({ params, url }) => {
	const vault = params.vault;
	const kvPath = params.path;
	const kvQuery = url.searchParams.toString();

	const kvUrl = `${emulatorUrl()}/ui/vaults/${encodeURIComponent(vault)}/${kvPath}${kvQuery ? '?' + kvQuery : ''}`;

	const res = await undiciFetch(kvUrl, {
		dispatcher: insecureAgent,
		headers: { 'content-type': 'application/json' }
	});

	const body = await res.text();
	return new Response(body, {
		status: res.status,
		headers: { 'content-type': 'application/json' }
	});
};
