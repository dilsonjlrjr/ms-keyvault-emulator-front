import { env } from '$env/dynamic/private';
import { getVaultClient } from '$lib/server/keyvault';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const client = getVaultClient();
	const data = await client.listVaults();
	return { vaults: data.value };
};

function getEmulatorHost() {
	const url = env.KEYVAULT_EMULATOR_URL?.trim() || 'https://localhost:13000';
	try {
		return new URL(url).host;
	} catch {
		return 'localhost:13000';
	}
}

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
			return {
				success: true,
				vaultName: name,
				tenantId: env.KEYVAULT_TENANT_ID?.trim() || 'a0c2a3f5-e1b3-4d6a-9c41-2cdd1f2c7e0f',
				emulatorHost: getEmulatorHost(),
				baseDomain: env.KEYVAULT_BASE_DOMAIN?.trim() || 'kvemu.local'
			};
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
