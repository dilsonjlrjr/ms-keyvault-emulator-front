import { error } from '@sveltejs/kit';

interface VaultItem {
	id?: string;
	kid?: string;
	key?: { kid?: string };
	attributes?: { enabled?: boolean; created?: number; updated?: number; expires?: number | null };
	tags?: Record<string, string>;
	name: string;
}

export async function load({ fetch }: { fetch: (url: string) => Promise<Response> }) {
	try {
		const res = await fetch('/api/kv/keys');
		if (!res.ok) {
			const msg = await res.text().catch(() => '');
			error(res.status, `KV request failed: ${msg}`);
		}
		const raw = await res.json();
		const keys: VaultItem[] = raw.value.map((item: any) => ({
			...item,
			name: extractName(item)
		}));
		return { keys };
	} catch (err) {
		if ((err as any).status) throw err;
		error(503, `Unable to connect to vault emulator: ${(err as Error).message}`);
	}
}

function extractName(item: { id?: string; kid?: string; key?: { kid?: string } }): string {
	const id: string = item.kid || item.key?.kid || item.id || '';
	const parts = id.split('/').filter(Boolean);
	const last = parts[parts.length - 1];
	if (last && /^[0-9a-f]{32}$/.test(last) && parts.length >= 2) return parts[parts.length - 2];
	return last || '';
}
