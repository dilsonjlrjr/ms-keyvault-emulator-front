import { env } from '$env/dynamic/private';
import { Agent, fetch as undiciFetch } from 'undici';
import type { RequestHandler } from './$types';

const insecureAgent = new Agent({ connect: { rejectUnauthorized: false } });

function emulatorUrl(): string {
	const base = env.KEYVAULT_EMULATOR_URL;
	if (!base) throw new Error('KEYVAULT_EMULATOR_URL not set');
	return base.replace(/\/+$/, '');
}

export const GET: RequestHandler = async ({ params }) => {
	const mgmtPath = params.path;
	const mgmtUrl = `${emulatorUrl()}/${mgmtPath}`;

	const res = await undiciFetch(mgmtUrl, {
		dispatcher: insecureAgent,
		headers: { 'content-type': 'application/json' }
	});

	const body = await res.text();
	return new Response(body, {
		status: res.status,
		headers: { 'content-type': 'application/json' }
	});
};

export const POST: RequestHandler = async ({ params, request }) => {
	const mgmtPath = params.path;
	const mgmtUrl = `${emulatorUrl()}/${mgmtPath}`;

	const contentType = request.headers.get('content-type') || 'application/json';
	const reqBody = await request.text();

	const res = await undiciFetch(mgmtUrl, {
		method: 'POST',
		dispatcher: insecureAgent,
		headers: { 'content-type': contentType },
		body: reqBody
	});

	const body = await res.text();
	return new Response(body, {
		status: res.status,
		headers: { 'content-type': 'application/json' }
	});
};

export const DELETE: RequestHandler = async ({ params }) => {
	const mgmtPath = params.path;
	const mgmtUrl = `${emulatorUrl()}/${mgmtPath}`;

	const res = await undiciFetch(mgmtUrl, {
		method: 'DELETE',
		dispatcher: insecureAgent,
		headers: { 'content-type': 'application/json' }
	});

	const body = await res.text();
	return new Response(body, {
		status: res.status,
		headers: { 'content-type': 'application/json' }
	});
};
