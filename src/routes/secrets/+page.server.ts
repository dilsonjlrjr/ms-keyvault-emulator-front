import { fail } from '@sveltejs/kit';
import { getVaultClient } from '$lib/server/keyvault';
import type { Actions } from './$types';

function vaultFrom(form: FormData): string {
	return String(form.get('vault') ?? '').trim() || 'vault';
}

export const actions: Actions = {
	create: async ({ request }) => {
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const value = String(form.get('value') ?? '');

		if (!name || !value) {
			return fail(400, { error: 'Name and value are required.' });
		}

		const client = getVaultClient(vaultFrom(form));
		await client.setSecret(name, value);
		return { success: true };
	},

	delete: async ({ request }) => {
		const form = await request.formData();
		const name = String(form.get('name') ?? '');
		if (!name) return fail(400, { error: 'Secret name is missing.' });

		const client = getVaultClient(vaultFrom(form));
		await client.deleteSecret(name);
		return { success: true };
	}
};
