import { env } from '$env/dynamic/private';
import { getVaultClient } from '$lib/server/keyvault';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const client = getVaultClient();
	let vaults: Array<{ name: string; displayName?: string; host: string }> = [];
	try {
		const data = await client.listVaults();
		vaults = data.value;
	} catch {
		// vaults vazio — emulador offline
	}

	const selectedVault = locals.selectedVault || env.KEYVAULT_DEFAULT_VAULT?.trim() || 'vault';

	return {
		vaultTitle: env.KEYVAULT_TITLE?.trim() || 'One Keyvault',
		vaults,
		selectedVault
	};
};
