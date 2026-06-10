import { error } from '@sveltejs/kit';
import { keyvault } from '$lib/server/keyvault';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const keys = await keyvault.listKeys();
		return { keys };
	} catch (err) {
		error(503, `Não foi possível conectar ao emulador do Key Vault: ${(err as Error).message}`);
	}
};
