import { error, fail, redirect } from '@sveltejs/kit';
import { getVaultClient } from '$lib/server/keyvault';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	try {
		const client = getVaultClient(locals.selectedVault);
		const secret = await client.getSecret(params.name);
		return { secret };
	} catch {
		error(404, 'Secret not found.');
	}
};

export const actions: Actions = {
	delete: async ({ params, locals }) => {
		try {
			const client = getVaultClient(locals.selectedVault);
			await client.deleteSecret(params.name);
		} catch (err) {
			return fail(500, { error: (err as Error).message });
		}
		redirect(303, '/secrets');
	}
};
