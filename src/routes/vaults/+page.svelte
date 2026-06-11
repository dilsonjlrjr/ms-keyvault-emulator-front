<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { getContext } from 'svelte';
	import { t } from '$lib/i18n';
	import IntegrationsGuide from '$lib/IntegrationsGuide.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const lang = getContext('lang') as string;
	const _ = (key: string) => t(key, lang);
	let showCreate = $state(false);

	const total = $derived(data.vaults.length);

	const createdVault = $derived(
		form?.vaultName ? data.vaults.find((v) => v.name === (form as any).vaultName) : null
	);

	const setup = $derived(
		createdVault && form?.tenantId
			? {
					endpoint: `https://${createdVault.host}`,
					host: createdVault.host,
					name: createdVault.name,
					tenantId: form.tenantId,
					emulatorHost: (form as any).emulatorHost || 'localhost:13000',
					baseDomain: (form as any).baseDomain || 'kvemu.local'
				}
			: null
	);
</script>

<div class="mx-auto" style="max-width: 48rem;">
	<div class="page-header">
		<div>
			<h1 class="page-title">{_('vaults.title')}</h1>
			<p class="page-subtitle">{_('vaults.subtitle')}</p>
		</div>
		<div class="flex gap-2">
			<a href="/vaults/import" class="btn btn-secondary">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
				</svg>
				{_('vaults.import')}
			</a>
			<button class="btn btn-primary" onclick={() => (showCreate = !showCreate)}>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
					<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
				</svg>
				{_('vaults.create')}
			</button>
		</div>
	</div>

	<!-- Stats -->
	<div class="mb-5 grid grid-cols-1 gap-3">
		<div class="stat-card">
			<p class="stat-label">{_('vaults.total')}</p>
			<p class="stat-value">{total}</p>
		</div>
	</div>

	{#if form?.error}
		<div class="form-msg form-msg-error mb-4">{form.error}</div>
	{/if}

	<!-- Create form -->
	{#if showCreate}
		<form
			method="POST"
			action="?/create"
			use:enhance={() => { showCreate = false; }}
			class="animate-fade-in card mb-5"
		>
			<div class="card-header">
				<h2 class="text-sm font-semibold" style="color: var(--text-primary);">{_('vaults.create')}</h2>
			</div>
			<div class="card-body space-y-3">
				<div>
					<label class="mb-1 block text-xs font-medium" style="color: var(--text-muted);" for="vault-name">{_('vaults.name_label')}</label>
					<input id="vault-name" type="text" name="name" required placeholder={_('vaults.name_placeholder')} class="input" />
					<p class="mt-1 text-xs" style="color: var(--text-muted);">
						Hostname: <code>your-name.kvemu.local:13000</code>
					</p>
				</div>
				<div>
					<label class="mb-1 block text-xs font-medium" style="color: var(--text-muted);" for="vault-display-name">{_('vaults.display_label')}</label>
					<input id="vault-display-name" type="text" name="display_name" placeholder={_('vaults.display_placeholder')} class="input" />
				</div>
				<div class="flex gap-2 pt-1">
					<button type="submit" class="btn btn-primary">{_('vaults.create')}</button>
					<button type="button" class="btn btn-secondary" onclick={() => (showCreate = false)}>{_('common.cancel')}</button>
				</div>
			</div>
		</form>
	{/if}

	<!-- ===== Setup Guide (after vault creation) ===== -->
	{#if form?.success && setup}
		<div class="animate-fade-in card mb-5" style="border-color: rgba(45, 212, 191, 0.25);">
			<div class="card-header" style="border-color: rgba(45, 212, 191, 0.10);">
				<div class="flex items-center gap-2">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
					</svg>
					<span class="text-sm font-semibold" style="color: var(--accent);">{_('vaults.vault_created')} — {_('vaults.setup_guide')}</span>
				</div>
				<span class="badge badge-muted">{setup.name}</span>
			</div>

			<div class="card-body">
				<p class="text-xs mb-4" style="color: var(--text-muted);">
					{_('vaults.use_guide')}
				</p>

				<IntegrationsGuide />

				<div class="flex gap-2 pt-4" style="border-top: 1px solid var(--border-subtle); margin-top: 1rem;">
					<a href="/vaults/{setup.name}/export" class="btn btn-secondary btn-sm">{_('vaults.export')}</a>
					<button
						class="btn btn-ghost btn-sm"
						onclick={() => {
							form = null;
						}}
					>
						{_('vaults.dismiss')}
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- ===== Vaults Table ===== -->
	{#if data.vaults.length === 0}
		<div class="empty-state">
			<svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
				<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
			</svg>
			<p class="empty-state-title">No vaults found</p>
			<p class="empty-state-desc">Create your first vault to start managing secrets, keys, and certificates.</p>
		</div>
	{:else}
		<div class="table-container">
			<table>
				<thead>
					<tr>
						<th>{_('vaults.th_vault')}</th>
						<th>Display Name</th>
						<th>{_('vaults.th_host')}</th>
						<th class="text-right">{_('vaults.th_actions')}</th>
					</tr>
				</thead>
				<tbody>
					{#each data.vaults as vault}
						<tr>
							<td>
								<span class="font-medium mono" style="background: transparent; padding: 0;">{vault.name}</span>
							</td>
							<td style="color: var(--text-secondary);">{vault.displayName || _('common.no_data')}</td>
							<td>
								<code class="text-xs" style="color: var(--text-muted);">{vault.host}</code>
							</td>
							<td class="text-right">
								<div class="flex justify-end gap-1.5">
									<a href="/vaults/{vault.name}/export" class="btn btn-secondary btn-sm">{_('vaults.export')}</a>
									<form method="POST" action="?/delete" use:enhance class="inline">
										<input type="hidden" name="name" value={vault.name} />
										<button
											type="submit"
											class="btn btn-danger btn-sm"
											onclick={(e) => { if (!confirm(`${_('vaults.delete_confirm')} "${vault.name}" and ALL its secrets, keys, and certificates?`)) e.preventDefault(); }}
										>
											{_('common.delete')}
										</button>
									</form>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
