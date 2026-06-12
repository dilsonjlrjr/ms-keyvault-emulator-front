export const ssr = false;

export async function load({ fetch }) {
	const selectedVault = safeGet('selected_vault') || 'vault';
	const lang = safeGet('lang') || 'en';

	let vaults: Array<{ name: string; displayName?: string; host: string }> = [];
	try {
		const res = await fetch('/api/mgmt/vaults');
		if (res.ok) {
			const data = await res.json();
			vaults = data.value;
		}
	} catch {
		// offline
	}

	return {
		vaultTitle: 'One Keyvault',
		vaults,
		selectedVault,
		lang
	};
}

function safeGet(key: string): string | null {
	if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
	return null;
}
