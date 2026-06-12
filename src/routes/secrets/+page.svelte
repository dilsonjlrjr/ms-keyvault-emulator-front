<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import type { ActionData, PageData } from './$types';
	import { t } from '$lib/i18n';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const _ = (key: string) => t(key, page.data.lang as string || 'en');

	let showCreate = $state(false);

	const total = $derived(data.secrets.length);
	const enabled = $derived(data.secrets.filter((s) => s.attributes?.enabled).length);
	const disabled = $derived(total - enabled);

	const vaultLabel = $derived(
		(page.data.vaults as Array<{ name: string; displayName?: string }> | undefined)?.find(
			(v) => v.name === page.data.selectedVault
		)?.displayName ||
			(page.data.selectedVault as string) ||
			'—'
	);

	function fmt(epoch?: number | null) {
		if (!epoch) return _('common.no_data');
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
		<h1 class="page-title">{_('secrets.title')}</h1>
		<p class="page-subtitle">{_('secrets.subtitle')}</p>
	</div>
	<button class="btn btn-primary" onclick={() => (showCreate = !showCreate)}>
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
			<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
		</svg>
		{_('secrets.create')}
	</button>
</div>

<!-- Stats row -->
<div class="mb-5 grid grid-cols-3 gap-3">
	<div class="stat-card">
		<p class="stat-label">{_('secrets.total')}</p>
		<p class="stat-value">{total}</p>
	</div>
	<div class="stat-card">
		<p class="stat-label">{_('secrets.enabled')}</p>
		<p class="stat-value" style="color: var(--success);">{enabled}</p>
	</div>
	<div class="stat-card">
		<p class="stat-label">{_('secrets.disabled')}</p>
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
			<h2 class="text-sm font-semibold" style="color: var(--text-primary);">{_('secrets.create')}</h2>
		</div>
		<div class="card-body space-y-3">
			<input type="hidden" name="vault" value={page.data.selectedVault} />
			<div>
				<label class="mb-1 block text-xs font-medium" style="color: var(--text-muted);" for="secret-name">{_('secrets.th_name')}</label>
				<input id="secret-name" name="name" required placeholder={_('secrets.name_placeholder')} class="input" />
			</div>
			<div>
				<label class="mb-1 block text-xs font-medium" style="color: var(--text-muted);" for="secret-value">{_('secrets.th_value')}</label>
				<textarea id="secret-value" name="value" required rows="3" placeholder={_('secrets.value_placeholder')} class="input" style="resize: vertical;"></textarea>
			</div>
			{#if form?.error}
				<div class="form-msg form-msg-error">{form.error}</div>
			{/if}
			<div class="flex gap-2 pt-1">
				<button type="submit" class="btn btn-primary">{_('secrets.save')}</button>
				<button type="button" class="btn btn-secondary" onclick={() => (showCreate = false)}>{_('secrets.cancel')}</button>
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
		<p class="empty-state-title">{_('secrets.empty_title')}</p>
		<p class="empty-state-desc">{_('secrets.empty_desc').replace('{vault}', vaultLabel)}</p>
	</div>
{:else}
	<div class="table-container">
		<table>
			<thead>
				<tr>
					<th>{_('secrets.th_name')}</th>
					<th>{_('secrets.th_status')}</th>
					<th>{_('secrets.th_updated')}</th>
					<th>{_('secrets.th_expiration')}</th>
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
								<span class="badge badge-success">{_('common.enabled')}</span>
							{:else}
								<span class="badge badge-danger">{_('common.disabled')}</span>
							{/if}
						</td>
						<td style="color: var(--text-secondary);">{fmt(secret.attributes?.updated)}</td>
						<td style="color: var(--text-secondary);">{fmt(secret.attributes?.expires)}</td>
						<td class="text-right">
							<form method="POST" action="?/delete" use:enhance class="inline">
								<input type="hidden" name="name" value={secret.name} />
								<input type="hidden" name="vault" value={page.data.selectedVault} />
								<button class="btn btn-ghost btn-sm" style="color: var(--danger);">{_('secrets.delete')}</button>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
