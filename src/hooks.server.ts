import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const selectedVault = event.cookies.get('selected_vault');
	if (selectedVault) {
		event.locals.selectedVault = selectedVault;
	}

	const lang = event.cookies.get('lang');
	if (lang) {
		event.locals.lang = lang;
	}

	return resolve(event);
};
