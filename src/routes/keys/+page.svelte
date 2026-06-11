<script lang="ts">
	import { page } from '$app/state';
	import type { PageData } from './$types';
	import { t } from '$lib/i18n';

	let { data }: { data: PageData } = $props();

	const _ = (key: string) => t(key, page.data.lang as string || 'en');

	const total = $derived(data.keys.length);
	const enabled = $derived(data.keys.filter((k) => k.attributes?.enabled).length);
	const disabled = $derived(total - enabled);

	const vaultLabel = $derived(
		(page.data.vaults as Array<{ name: string; displayName?: string }> | undefined)?.find(
			(v) => v.name === page.data.selectedVault
		)?.displayName ||
			(page.data.selectedVault as string) ||
			'—'
	);

	function fmt(epoch?: number | null) {
		if (!epoch) return '—';
		return new Date(epoch * 1000).toLocaleDateString('en-US', {
			month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
		});
	}
</script>

<div class="page-header">
	<div>
		<h1 class="page-title">{_('keys.title')}</h1>
		<p class="page-subtitle">{_('keys.subtitle')}</p>
	</div>
</div>

<!-- Stats -->
<div class="mb-5 grid grid-cols-3 gap-3">
	<div class="stat-card">
		<p class="stat-label">{_('keys.total')}</p>
		<p class="stat-value">{total}</p>
	</div>
	<div class="stat-card">
		<p class="stat-label">{_('keys.enabled')}</p>
		<p class="stat-value" style="color: var(--success);">{enabled}</p>
	</div>
	<div class="stat-card">
		<p class="stat-label">{_('keys.disabled')}</p>
		<p class="stat-value" style="color: var(--text-muted);">{disabled}</p>
	</div>
</div>

{#if data.keys.length === 0}
	<div class="empty-state">
		<svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
			<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
		</svg>
		<p class="empty-state-title">{_('keys.empty_title')}</p>
		<p class="empty-state-desc">{_('keys.empty_desc').replace('{vault}', vaultLabel)}</p>
	</div>
{:else}
	<div class="table-container">
		<table>
			<thead>
				<tr>
					<th>{_('keys.th_name')}</th>
					<th>{_('keys.th_status')}</th>
					<th>{_('keys.th_updated')}</th>
					<th>{_('keys.th_expiration')}</th>
				</tr>
			</thead>
			<tbody>
				{#each data.keys as key (key.name)}
					<tr>
						<td>
							<span class="font-medium mono" style="background: transparent; padding: 0;">{key.name}</span>
						</td>
						<td>
							{#if key.attributes?.enabled}
								<span class="badge badge-success">{_('common.enabled')}</span>
							{:else}
								<span class="badge badge-danger">{_('common.disabled')}</span>
							{/if}
						</td>
						<td style="color: var(--text-secondary);">{fmt(key.attributes?.updated)}</td>
						<td style="color: var(--text-secondary);">{fmt(key.attributes?.expires)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
