<script lang="ts">
	import { page } from '$app/state';
	import type { PageData } from './$types';
	import { t } from '$lib/i18n';

	let { data }: { data: PageData } = $props();

	const _ = (key: string) => t(key, page.data.lang as string || 'en');

	const total = $derived(data.certificates.length);
	const enabled = $derived(data.certificates.filter((c) => c.attributes?.enabled).length);
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
		<h1 class="page-title">{_('certs.title')}</h1>
		<p class="page-subtitle">{_('certs.subtitle')}</p>
	</div>
</div>

<!-- Stats -->
<div class="mb-5 grid grid-cols-3 gap-3">
	<div class="stat-card">
		<p class="stat-label">{_('certs.total')}</p>
		<p class="stat-value">{total}</p>
	</div>
	<div class="stat-card">
		<p class="stat-label">{_('certs.enabled')}</p>
		<p class="stat-value" style="color: var(--success);">{enabled}</p>
	</div>
	<div class="stat-card">
		<p class="stat-label">{_('certs.disabled')}</p>
		<p class="stat-value" style="color: var(--text-muted);">{disabled}</p>
	</div>
</div>

{#if data.certificates.length === 0}
	<div class="empty-state">
		<svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
			<path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
		</svg>
		<p class="empty-state-title">{_('certs.empty_title')}</p>
		<p class="empty-state-desc">{_('certs.empty_desc').replace('{vault}', vaultLabel)}</p>
	</div>
{:else}
	<div class="table-container">
		<table>
			<thead>
				<tr>
					<th>{_('certs.th_name')}</th>
					<th>{_('certs.th_status')}</th>
					<th>{_('certs.th_updated')}</th>
					<th>{_('certs.th_expiration')}</th>
				</tr>
			</thead>
			<tbody>
				{#each data.certificates as cert (cert.id)}
					<tr>
						<td>
							<span class="font-medium mono" style="background: transparent; padding: 0;">{cert.name}</span>
						</td>
						<td>
							{#if cert.attributes?.enabled}
								<span class="badge badge-success">{_('common.enabled')}</span>
							{:else}
								<span class="badge badge-danger">{_('common.disabled')}</span>
							{/if}
						</td>
						<td style="color: var(--text-secondary);">{fmt(cert.attributes?.updated)}</td>
						<td style="color: var(--text-secondary);">{fmt(cert.attributes?.expires)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
