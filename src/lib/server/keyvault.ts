import { Agent, fetch as undiciFetch, type RequestInit as UndiciRequestInit } from 'undici';
import { env } from '$env/dynamic/private';

const API_VERSION = '7.4';

const insecureAgent = new Agent({ connect: { rejectUnauthorized: false } });

function vaultUrl() {
	const base = env.KEYVAULT_EMULATOR_URL;
	if (!base) {
		throw new Error('Variável de ambiente KEYVAULT_EMULATOR_URL não configurada.');
	}
	return base.replace(/\/+$/, '');
}

function tenantId() {
	return env.KEYVAULT_TENANT_ID?.trim() || 'a0c2a3f5-e1b3-4d6a-9c41-2cdd1f2c7e0f';
}

let cachedToken: { value: string; expiresAt: number } | null = null;
const TOKEN_TTL_MS = 25 * 60 * 1000;

async function getToken(): Promise<string> {
	if (cachedToken && cachedToken.expiresAt > Date.now()) {
		return cachedToken.value;
	}

	const baseURL = vaultUrl();
	const host = baseURL.replace(/^https?:\/\//, '');
	const scope = `https://${host}/.default`;
	const params = new URLSearchParams({
		grant_type: 'client_credentials',
		client_id: 'kv-interface',
		client_secret: 'kv-interface-secret',
		scope
	});

	const tokenURL = `${baseURL}/${tenantId()}/oauth2/v2.0/token`;
	const res = await undiciFetch(tokenURL, {
		method: 'POST',
		dispatcher: insecureAgent,
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		body: params.toString()
	});

	if (!res.ok) {
		const body = await res.text().catch(() => '');
		throw new Error(`Falha ao obter token do emulador: ${res.status} ${res.statusText} ${body}`);
	}

	const data = (await res.json()) as { access_token: string; expires_in: number };
	if (!data.access_token) {
		throw new Error('Token vazio retornado pelo emulador.');
	}

	const ttlMs = Math.min((data.expires_in || 3600) * 1000, TOKEN_TTL_MS);
	cachedToken = { value: data.access_token, expiresAt: Date.now() + ttlMs };
	return data.access_token;
}

async function request<T>(path: string, init?: UndiciRequestInit): Promise<T> {
	const url = `${vaultUrl()}${path}${path.includes('?') ? '&' : '?'}api-version=${API_VERSION}`;
	const token = await getToken();

	const res = await undiciFetch(url, {
		...init,
		dispatcher: insecureAgent,
		headers: {
			'content-type': 'application/json',
			authorization: `Bearer ${token}`,
			...(init?.headers ?? {})
		}
	});

	if (res.status === 401 || res.status === 403) {
		cachedToken = null;
		const freshToken = await getToken();
		const retry = await undiciFetch(url, {
			...init,
			dispatcher: insecureAgent,
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer ${freshToken}`,
				...(init?.headers ?? {})
			}
		});
		return finishResponse<T>(retry, path);
	}

	return finishResponse<T>(res, path);
}

async function finishResponse<T>(res: Awaited<ReturnType<typeof undiciFetch>>, path: string): Promise<T> {
	if (!res.ok) {
		const body = await res.text().catch(() => '');
		throw new Error(`Emulador respondeu ${res.status} ${res.statusText} em ${path}: ${body}`);
	}

	if (res.status === 204) return undefined as T;

	return (await res.json()) as T;
}

export interface VaultItem {
	id: string;
	attributes?: {
		enabled?: boolean;
		created?: number;
		updated?: number;
		expires?: number | null;
	};
	tags?: Record<string, string>;
}

export interface VaultItemList {
	value: VaultItem[];
	nextLink?: string | null;
}

export interface SecretBundle extends VaultItem {
	value?: string;
	contentType?: string | null;
}

function nameFromId(id: string) {
	const parts = id.split('/');
	return parts.length >= 2 ? parts[parts.length - 2] : parts[parts.length - 1];
}

export const keyvault = {
	async listSecrets() {
		const data = await request<VaultItemList>('/secrets');
		return data.value.map((item) => ({ ...item, name: nameFromId(item.id) }));
	},

	async getSecret(name: string) {
		const data = await request<SecretBundle>(`/secrets/${encodeURIComponent(name)}`);
		return { ...data, name };
	},

	async setSecret(name: string, value: string, contentType?: string) {
		return request<SecretBundle>(`/secrets/${encodeURIComponent(name)}`, {
			method: 'PUT',
			body: JSON.stringify({ value, contentType: contentType || undefined })
		});
	},

	async deleteSecret(name: string) {
		return request<VaultItem>(`/secrets/${encodeURIComponent(name)}`, { method: 'DELETE' });
	},

	async listKeys() {
		const data = await request<VaultItemList>('/keys');
		return data.value.map((item) => ({ ...item, name: nameFromId(item.id) }));
	},

	async listCertificates() {
		const data = await request<VaultItemList>('/certificates');
		return data.value.map((item) => ({ ...item, name: nameFromId(item.id) }));
	}
};
