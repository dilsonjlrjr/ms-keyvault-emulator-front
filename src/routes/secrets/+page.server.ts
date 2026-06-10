import { error, fail } from '@sveltejs/kit';
import { keyvault } from '$lib/server/keyvault';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const secrets = await keyvault.listSecrets();
		return { secrets };
	} catch (err) {
		error(503, `Não foi possível conectar ao emulador do Key Vault: ${(err as Error).message}`);
	}
};

export const actions: Actions = {
	create: async ({ request }) => {
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const value = String(form.get('value') ?? '');

		if (!name || !value) {
			return fail(400, { error: 'Informe nome e valor do secret.' });
		}

		await keyvault.setSecret(name, value);
		return { success: true };
	},

	delete: async ({ request }) => {
		const form = await request.formData();
		const name = String(form.get('name') ?? '');
		if (!name) return fail(400, { error: 'Nome do secret ausente.' });

		await keyvault.deleteSecret(name);
		return { success: true };
	}
};
