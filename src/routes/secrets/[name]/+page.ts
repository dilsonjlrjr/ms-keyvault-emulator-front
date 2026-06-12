import { error } from '@sveltejs/kit';

interface SecretBundle {
	value?: string;
	contentType?: string | null;
	id?: string;
	attributes?: any;
	tags?: any;
	name: string;
}

export async function load({ fetch, parent, params }: { fetch: (url: string) => Promise<Response>; parent: () => Promise<{ selectedVault: string }>; params: { name: string } }) {
	const { selectedVault } = await parent();
	try {
		const res = await fetch(`/api/vault/${selectedVault}/kv/secrets/${encodeURIComponent(params.name)}`);
		if (!res.ok) error(404, 'Secret not found.');
		const data = await res.json();
		return { secret: { ...data, name: params.name } as SecretBundle };
	} catch (err) {
		if ((err as any).status) throw err;
		error(503, `Unable to connect to vault emulator: ${(err as Error).message}`);
	}
}
