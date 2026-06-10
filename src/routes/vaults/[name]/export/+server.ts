import { getVaultClient } from '$lib/server/keyvault';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const client = getVaultClient();
		const data = await client.exportVault(params.name);

		const json = JSON.stringify(data, null, 2);
		return new Response(json, {
			headers: {
				'Content-Type': 'application/json',
				'Content-Disposition': `attachment; filename="${params.name}.json"`
			}
		});
	} catch (e: any) {
		error(500, e.message);
	}
};
