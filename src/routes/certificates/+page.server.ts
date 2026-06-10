import { error } from '@sveltejs/kit';
import { getVaultClient } from '$lib/server/keyvault';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	try {
		const client = getVaultClient(locals.selectedVault);
		const certificates = await client.listCertificates();
		return { certificates };
	} catch (err) {
		error(503, `Unable to connect to vault emulator: ${(err as Error).message}`);
	}
};
