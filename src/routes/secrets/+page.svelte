<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showCreate = $state(false);

	const total = $derived(data.secrets.length);
	const enabled = $derived(data.secrets.filter((s) => s.attributes?.enabled).length);
	const disabled = $derived(total - enabled);

	function fmt(epoch?: number | null) {
		if (!epoch) return '—';
		return new Date(epoch * 1000).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<!-- Page header -->
<div class="page-header">
	<div>
		<h1 class="page-title">Secrets</h1>
		<p class="page-subtitle">Manage secrets stored in your key vault.</p>
	</div>
	<button class="btn btn-primary" onclick={() => (showCreate = !showCreate)}>
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
			<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
		</svg>
		New Secret
	</button>
</div>

<!-- Stats row -->
<div class="mb-5 grid grid-cols-3 gap-3">
	<div class="stat-card">
		<p class="stat-label">Total Secrets</p>
		<p class="stat-value">{total}</p>
	</div>
	<div class="stat-card">
		<p class="stat-label">Enabled</p>
		<p class="stat-value" style="color: var(--success);">{enabled}</p>
	</div>
	<div class="stat-card">
		<p class="stat-label">Disabled</p>
		<p class="stat-value" style="color: var(--text-muted);">{disabled}</p>
	</div>
</div>

<!-- Create form -->
{#if showCreate}
	<form
		method="POST"
		action="?/create"
		use:enhance={() =>
			({ update }) => {
				showCreate = false;
				update();
			}}
		class="animate-fade-in card mb-5 max-w-lg"
	>
		<div class="card-header">
			<h2 class="text-sm font-semibold" style="color: var(--text-primary);">Create Secret</h2>
		</div>
		<div class="card-body space-y-3">
			<div>
				<label class="mb-1 block text-xs font-medium" style="color: var(--text-muted);" for="secret-name">Name</label>
				<input id="secret-name" name="name" required placeholder="my-secret-key" class="input" />
			</div>
			<div>
				<label class="mb-1 block text-xs font-medium" style="color: var(--text-muted);" for="secret-value">Value</label>
				<textarea id="secret-value" name="value" required rows="3" placeholder="••••••••" class="input" style="resize: vertical;"></textarea>
			</div>
			{#if form?.error}
				<div class="form-msg form-msg-error">{form.error}</div>
			{/if}
			<div class="flex gap-2 pt-1">
				<button type="submit" class="btn btn-primary">Create</button>
				<button type="button" class="btn btn-secondary" onclick={() => (showCreate = false)}>Cancel</button>
			</div>
		</div>
	</form>
{/if}

<!-- Table -->
{#if data.secrets.length === 0}
	<div class="empty-state">
		<svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
			<path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
		</svg>
		<p class="empty-state-title">No secrets found</p>
		<p class="empty-state-desc">Create your first secret to start storing sensitive data in the vault.</p>
	</div>
{:else}
	<div class="table-container">
		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Status</th>
					<th>Updated</th>
					<th>Expiration</th>
					<th class="w-0"></th>
				</tr>
			</thead>
			<tbody>
				{#each data.secrets as secret (secret.id)}
					<tr>
						<td>
							<a href={`/secrets/${secret.name}`} class="link font-medium">{secret.name}</a>
						</td>
						<td>
							{#if secret.attributes?.enabled}
								<span class="badge badge-success">Enabled</span>
							{:else}
								<span class="badge badge-danger">Disabled</span>
							{/if}
						</td>
						<td style="color: var(--text-secondary);">{fmt(secret.attributes?.updated)}</td>
						<td style="color: var(--text-secondary);">{fmt(secret.attributes?.expires)}</td>
						<td class="text-right">
							<form method="POST" action="?/delete" use:enhance class="inline">
								<input type="hidden" name="name" value={secret.name} />
								<button class="btn btn-ghost btn-sm" style="color: var(--danger);">Delete</button>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
