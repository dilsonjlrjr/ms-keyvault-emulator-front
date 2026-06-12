import { fail, redirect } from '@sveltejs/kit';
import { getVaultClient } from '$lib/server/keyvault';
import type { Actions } from './$types';

export const actions: Actions = {
	delete: async ({ request }) => {
		const form = await request.formData();
		const name = String(form.get('name') ?? '');
		const vault = String(form.get('vault') ?? '').trim() || 'vault';
		if (!name) return fail(400, { error: 'Secret name is missing.' });
		try {
			const client = getVaultClient(vault);
			await client.deleteSecret(name);
		} catch (err) {
			return fail(500, { error: (err as Error).message });
		}
		redirect(303, '/secrets');
	}
};
