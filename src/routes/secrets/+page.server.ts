import { fail } from '@sveltejs/kit';
import { getVaultClient } from '$lib/server/keyvault';
import type { Actions } from './$types';

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
