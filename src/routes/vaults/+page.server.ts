import { getVaultClient } from '$lib/server/keyvault';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const client = getVaultClient();
	const data = await client.listVaults();
	return { vaults: data.value };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString()?.trim().toLowerCase();
		const displayName = data.get('display_name')?.toString()?.trim();

		if (!name) return fail(400, { error: 'Name is required' });
		if (!/^[a-z0-9]([a-z0-9-]{0,22}[a-z0-9])?$/.test(name)) {
			return fail(400, { error: 'Invalid name: use lowercase letters, numbers, and hyphens (1-24 chars)' });
		}

		try {
			const client = getVaultClient();
			await client.createVault(name, displayName || undefined);
			return { success: true };
		} catch (e: any) {
			return fail(500, { error: e.message });
		}
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString();

		if (!name) return fail(400, { error: 'Name is required' });

		try {
			const client = getVaultClient();
			await client.deleteVault(name);
			return { success: true };
		} catch (e: any) {
			return fail(500, { error: e.message });
		}
	}
};
