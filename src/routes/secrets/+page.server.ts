import { error, fail } from '@sveltejs/kit';
import { getVaultClient } from '$lib/server/keyvault';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	try {
		const client = getVaultClient(locals.selectedVault);
		const secrets = await client.listSecrets();
		return { secrets };
	} catch (err) {
		error(503, `Unable to connect to vault emulator: ${(err as Error).message}`);
	}
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const value = String(form.get('value') ?? '');

		if (!name || !value) {
			return fail(400, { error: 'Name and value are required.' });
		}

		const client = getVaultClient(locals.selectedVault);
		await client.setSecret(name, value);
		return { success: true };
	},

	delete: async ({ request, locals }) => {
		const form = await request.formData();
		const name = String(form.get('name') ?? '');
		if (!name) return fail(400, { error: 'Secret name is missing.' });

		const client = getVaultClient(locals.selectedVault);
		await client.deleteSecret(name);
		return { success: true };
	}
};
