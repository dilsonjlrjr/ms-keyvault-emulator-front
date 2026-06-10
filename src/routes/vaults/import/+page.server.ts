import { getVaultClient } from '$lib/server/keyvault';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	import: async ({ request }) => {
		const data = await request.formData();
		const file = data.get('file') as File | null;

		if (!file || file.size === 0) {
			return fail(400, { error: 'Please select a JSON file to import.' });
		}

		let json: any;
		try {
			const text = await file.text();
			json = JSON.parse(text);
		} catch {
			return fail(400, { error: 'Invalid JSON file.' });
		}

		if (!json.vault?.name) {
			return fail(400, { error: 'Invalid export format: missing vault.name' });
		}

		try {
			const client = getVaultClient();
			const result = await client.importVault(json);

			return {
				success: true,
				result: {
					vault: result.vault,
					secrets_created: result.secrets_created,
					secrets_skipped: result.secrets_skipped,
					keys_created: result.keys_created,
					keys_skipped: result.keys_skipped,
					certs_created: result.certs_created,
					certs_skipped: result.certs_skipped
				}
			};
		} catch (e: any) {
			return fail(500, { error: e.message });
		}
	}
};
