<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let showCreate = $state(false);

	const total = $derived(data.vaults.length);
</script>

<div class="mx-auto" style="max-width: 48rem;">
	<div class="page-header">
		<div>
			<h1 class="page-title">Vaults</h1>
			<p class="page-subtitle">Manage your key vault instances.</p>
		</div>
		<div class="flex gap-2">
			<a href="/vaults/import" class="btn btn-secondary">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
				</svg>
				Import
			</a>
			<button class="btn btn-primary" onclick={() => (showCreate = !showCreate)}>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
					<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
				</svg>
				New Vault
			</button>
		</div>
	</div>

	<!-- Stats -->
	<div class="mb-5 grid grid-cols-1 gap-3">
		<div class="stat-card">
			<p class="stat-label">Total Vaults</p>
			<p class="stat-value">{total}</p>
		</div>
	</div>

	{#if form?.error}
		<div class="form-msg form-msg-error mb-4">{form.error}</div>
	{/if}
	{#if form?.success}
		<div class="form-msg form-msg-success mb-4">Operation completed successfully.</div>
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
				<h2 class="text-sm font-semibold" style="color: var(--text-primary);">Create New Vault</h2>
			</div>
			<div class="card-body space-y-3">
				<div>
					<label class="mb-1 block text-xs font-medium" style="color: var(--text-muted);" for="vault-name">Vault Name</label>
					<input id="vault-name" type="text" name="name" required placeholder="my-vault" class="input" />
					<p class="mt-1 text-xs" style="color: var(--text-muted);">
						Hostname: <code>your-name.kvemu.local:13000</code>
					</p>
				</div>
				<div>
					<label class="mb-1 block text-xs font-medium" style="color: var(--text-muted);" for="vault-display-name">Display Name <span style="color: var(--text-muted);">(optional)</span></label>
					<input id="vault-display-name" type="text" name="display_name" placeholder="My Production Vault" class="input" />
				</div>
				<div class="flex gap-2 pt-1">
					<button type="submit" class="btn btn-primary">Create</button>
					<button type="button" class="btn btn-secondary" onclick={() => (showCreate = false)}>Cancel</button>
				</div>
			</div>
		</form>
	{/if}

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
						<th>Name</th>
						<th>Display Name</th>
						<th>Host</th>
						<th class="text-right">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each data.vaults as vault}
						<tr>
							<td>
								<span class="font-medium mono" style="background: transparent; padding: 0;">{vault.name}</span>
							</td>
							<td style="color: var(--text-secondary);">{vault.displayName || '—'}</td>
							<td>
								<code class="text-xs" style="color: var(--text-muted);">{vault.host}</code>
							</td>
							<td class="text-right">
								<div class="flex justify-end gap-1.5">
									<a href="/vaults/{vault.name}/export" class="btn btn-secondary btn-sm">Export</a>
									<form method="POST" action="?/delete" use:enhance class="inline">
										<input type="hidden" name="name" value={vault.name} />
										<button
											type="submit"
											class="btn btn-danger btn-sm"
											onclick={(e) => { if (!confirm(`Delete vault "${vault.name}" and ALL its secrets, keys, and certificates?`)) e.preventDefault(); }}
										>
											Delete
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
