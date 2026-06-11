<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const total = $derived(data.keys.length);
	const enabled = $derived(data.keys.filter((k) => k.attributes?.enabled).length);
	const disabled = $derived(total - enabled);

	function fmt(epoch?: number | null) {
		if (!epoch) return '—';
		return new Date(epoch * 1000).toLocaleDateString('en-US', {
			month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
		});
	}
</script>

<div class="page-header">
	<div>
		<h1 class="page-title">Keys</h1>
		<p class="page-subtitle">Cryptographic keys stored in your key vault.</p>
	</div>
</div>

<!-- Stats -->
<div class="mb-5 grid grid-cols-3 gap-3">
	<div class="stat-card">
		<p class="stat-label">Total Keys</p>
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

{#if data.keys.length === 0}
	<div class="empty-state">
		<svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
			<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
		</svg>
		<p class="empty-state-title">No keys found</p>
		<p class="empty-state-desc">Cryptographic keys will appear here once they are created in the vault.</p>
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
								<span class="badge badge-success">Enabled</span>
							{:else}
								<span class="badge badge-danger">Disabled</span>
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
