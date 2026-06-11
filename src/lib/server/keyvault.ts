import { Agent, fetch as undiciFetch, type RequestInit as UndiciRequestInit } from 'undici';
import { env } from '$env/dynamic/private';

const API_VERSION = '7.4';

const insecureAgent = new Agent({ connect: { rejectUnauthorized: false } });

function emulatorUrl(): string {
	const base = env.KEYVAULT_EMULATOR_URL;
	if (!base) throw new Error('KEYVAULT_EMULATOR_URL not set');
	return base.replace(/\/+$/, '');
}

function baseDomain(): string {
	return env.KEYVAULT_BASE_DOMAIN?.trim() || extractDomain(emulatorUrl());
}

function emulatorPort(): string {
	try {
		return new URL(emulatorUrl()).port || '13000';
	} catch {
		return '13000';
	}
}

function extractDomain(url: string): string {
	try {
		const host = new URL(url).hostname;
		return host === 'localhost' ? 'localhost' : host;
	} catch {
		return 'localhost';
	}
}

function tenantId(): string {
	return env.KEYVAULT_TENANT_ID?.trim() || 'a0c2a3f5-e1b3-4d6a-9c41-2cdd1f2c7e0f';
}

let cachedToken: { value: string; expiresAt: number } | null = null;
const TOKEN_TTL_MS = 25 * 60 * 1000;

async function getToken(): Promise<string> {
	if (cachedToken && cachedToken.expiresAt > Date.now()) {
		return cachedToken.value;
	}

	const baseURL = emulatorUrl();
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
		throw new Error(`Token fetch failed: ${res.status} ${body}`);
	}

	const data = (await res.json()) as { access_token: string; expires_in: number };
	if (!data.access_token) throw new Error('Empty token returned');

	const ttlMs = Math.min((data.expires_in || 3600) * 1000, TOKEN_TTL_MS);
	cachedToken = { value: data.access_token, expiresAt: Date.now() + ttlMs };
	return data.access_token;
}

async function finishResponse<T>(res: Awaited<ReturnType<typeof undiciFetch>>, path: string): Promise<T> {
	if (!res.ok) {
		const body = await res.text().catch(() => '');
		throw new Error(`Emulator responded ${res.status} at ${path}: ${body}`);
	}
	if (res.status === 204) return undefined as T;
	return (await res.json()) as T;
}

function nameFromId(id: string) {
	const parts = id.split('/').filter(Boolean);
	const last = parts[parts.length - 1];
	const versionPattern = /^[0-9a-f]{32}$/;
	if (last && versionPattern.test(last) && parts.length >= 2) {
		return parts[parts.length - 2];
	}
	return last || '';
}

export interface VaultItem {
	id?: string;
	key?: { kid?: string };
	attributes?: { enabled?: boolean; created?: number; updated?: number; expires?: number | null };
	tags?: Record<string, string>;
}

function itemName(item: VaultItem): string {
	const keyId: string = (item as any).kid || item.key?.kid || item.id || '';
	return nameFromId(keyId);
}

export interface VaultItemList {
	value: VaultItem[];
	nextLink?: string | null;
}

export interface SecretBundle extends VaultItem {
	value?: string;
	contentType?: string | null;
}

export interface VaultInfo {
	name: string;
	host: string;
	displayName?: string;
	tenantId: string;
	created: number;
	updated: number;
}

export interface VaultListResponse {
	value: VaultInfo[];
}

export interface VaultExportData {
	version: string;
	vault: { name: string; display_name?: string; tenant_id: string };
	secrets: Array<{
		name: string;
		value: string;
		content_type?: string;
		tags?: Record<string, string>;
		attributes?: { enabled?: boolean; nbf?: number; exp?: number };
	}>;
	keys: Array<{
		name: string;
		kty: string;
		key_size?: number;
		crv?: string;
		key_ops?: string[];
		tags?: Record<string, string>;
	}>;
	certificates: Array<{
		name: string;
		policy_json?: Record<string, any>;
		cer_base64?: string;
		tags?: Record<string, string>;
	}>;
}

export interface ImportResult {
	vault: string;
	secrets_created: number;
	secrets_skipped: number;
	keys_created: number;
	keys_skipped: number;
	certs_created: number;
	certs_skipped: number;
}

export class KeyVaultClient {
	private vaultName: string;

	constructor(vaultName: string) {
		this.vaultName = vaultName;
	}

	get vaultUrl(): string {
		const domain = baseDomain();
		const port = emulatorPort();
		if (domain === this.vaultName || this.vaultName === domain) {
			return `https://${domain}:${port}`;
		}
		return `https://${this.vaultName}.${domain}:${port}`;
	}

	private get managementUrl(): string {
		return emulatorUrl();
	}

	private async request<T>(path: string, init?: UndiciRequestInit): Promise<T> {
		const url = `${this.vaultUrl}${path}${path.includes('?') ? '&' : '?'}api-version=${API_VERSION}`;
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

	private async mgmtRequest<T>(path: string, init?: UndiciRequestInit): Promise<T> {
		const url = `${this.managementUrl}${path}`;
		const res = await undiciFetch(url, {
			...init,
			dispatcher: insecureAgent,
			headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) }
		});
		return finishResponse<T>(res, path);
	}

	async listSecrets() {
		const data = await this.request<VaultItemList>('/secrets');
		return data.value.map((item) => ({ ...item, name: itemName(item) }));
	}

	async getSecret(name: string) {
		const data = await this.request<SecretBundle>(`/secrets/${encodeURIComponent(name)}`);
		return { ...data, name };
	}

	async setSecret(name: string, value: string, contentType?: string) {
		return this.request<SecretBundle>(`/secrets/${encodeURIComponent(name)}`, {
			method: 'PUT',
			body: JSON.stringify({ value, contentType: contentType || undefined })
		});
	}

	async deleteSecret(name: string) {
		return this.request<VaultItem>(`/secrets/${encodeURIComponent(name)}`, { method: 'DELETE' });
	}

	async listKeys() {
		const data = await this.request<VaultItemList>('/keys');
		return data.value.map((item) => ({ ...item, name: itemName(item) }));
	}

	async listCertificates() {
		const data = await this.request<VaultItemList>('/certificates');
		return data.value.map((item) => ({ ...item, name: itemName(item) }));
	}

	async listVaults(): Promise<VaultListResponse> {
		return this.mgmtRequest<VaultListResponse>('/vaults');
	}

	async createVault(name: string, displayName?: string): Promise<VaultInfo> {
		return this.mgmtRequest<VaultInfo>('/vaults', {
			method: 'POST',
			body: JSON.stringify({ name, displayName: displayName || undefined, tenantId: tenantId() })
		});
	}

	async getVault(name: string): Promise<VaultInfo> {
		return this.mgmtRequest<VaultInfo>(`/vaults/${encodeURIComponent(name)}`);
	}

	async deleteVault(name: string): Promise<void> {
		return this.mgmtRequest<void>(`/vaults/${encodeURIComponent(name)}`, { method: 'DELETE' });
	}

	async exportVault(name: string): Promise<VaultExportData> {
		return this.mgmtRequest<VaultExportData>(`/vaults/${encodeURIComponent(name)}/export`);
	}

	async importVault(data: VaultExportData): Promise<ImportResult> {
		return this.mgmtRequest<ImportResult>('/vaults/import', {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}
}

let defaultClient: KeyVaultClient | null = null;

export function getVaultClient(vaultName?: string): KeyVaultClient {
	if (!vaultName) {
		vaultName = env.KEYVAULT_DEFAULT_VAULT?.trim() || 'vault';
	}
	if (!defaultClient || defaultClient.vaultUrl !== new KeyVaultClient(vaultName).vaultUrl) {
		defaultClient = new KeyVaultClient(vaultName);
	}
	return defaultClient;
}
