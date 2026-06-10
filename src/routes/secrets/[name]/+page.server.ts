import { error, fail, redirect } from '@sveltejs/kit';
import { keyvault } from '$lib/server/keyvault';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const secret = await keyvault.getSecret(params.name);
		return { secret };
	} catch {
		error(404, 'Secret não encontrado no emulador.');
	}
};

export const actions: Actions = {
	delete: async ({ params }) => {
		try {
			await keyvault.deleteSecret(params.name);
		} catch (err) {
			return fail(500, { error: (err as Error).message });
		}
		redirect(303, '/secrets');
	}
};
