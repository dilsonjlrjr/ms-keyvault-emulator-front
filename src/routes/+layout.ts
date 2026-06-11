export const ssr = false;

export async function load({ fetch }) {
	const selectedVault = getCookie('selected_vault') || 'vault';
	const lang = getCookie('lang') || 'en';

	let vaults: Array<{ name: string; displayName?: string; host: string }> = [];
	try {
		const res = await fetch('/api/mgmt/vaults');
		if (res.ok) {
			const data = await res.json();
			vaults = data.value;
		}
	} catch {
		// offline — vaults vazio
	}

	return {
		vaultTitle: 'One Keyvault',
		vaults,
		selectedVault,
		lang
	};
}

function getCookie(name: string): string | null {
	if (typeof document === 'undefined') return null;
	const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
	return match?.[1] ?? null;
}
