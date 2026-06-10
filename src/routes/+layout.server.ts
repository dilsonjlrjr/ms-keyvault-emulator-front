import { env } from '$env/dynamic/private';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	return {
		vaultTitle: env.KEYVAULT_TITLE?.trim() || 'One Keyvault'
	};
};
