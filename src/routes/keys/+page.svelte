<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function fmt(epoch?: number | null) {
		if (!epoch) return '—';
		return new Date(epoch * 1000).toLocaleString('pt-BR');
	}
</script>

<h1 class="mb-1 text-xl font-semibold">Keys</h1>
<p class="mb-4 text-sm" style="color: var(--mc-text-muted);">Chaves criptográficas do Key Vault Emulator.</p>

<div class="overflow-hidden rounded border" style="background: var(--mc-surface); border-color: var(--mc-border);">
	<table class="w-full text-sm">
		<thead style="background: var(--mc-bg);">
			<tr class="text-left" style="color: var(--mc-text-muted);">
				<th class="px-3 py-2 font-medium">Name</th>
				<th class="px-3 py-2 font-medium">Status</th>
				<th class="px-3 py-2 font-medium">Updated</th>
				<th class="px-3 py-2 font-medium">Expiration</th>
			</tr>
		</thead>
		<tbody>
			{#each data.keys as key (key.id)}
				<tr class="border-t" style="border-color: var(--mc-border);">
					<td class="px-3 py-2">{key.name}</td>
					<td class="px-3 py-2">
						{#if key.attributes?.enabled}
							<span class="text-green-700">Enabled</span>
						{:else}
							<span style="color: var(--mc-text-muted);">Disabled</span>
						{/if}
					</td>
					<td class="px-3 py-2">{fmt(key.attributes?.updated)}</td>
					<td class="px-3 py-2">{fmt(key.attributes?.expires)}</td>
				</tr>
			{:else}
				<tr>
					<td colspan="4" class="px-3 py-6 text-center" style="color: var(--mc-text-muted);">
						Nenhuma key encontrada.
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
