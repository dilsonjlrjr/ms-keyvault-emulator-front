<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showCreate = $state(false);

	function fmt(epoch?: number | null) {
		if (!epoch) return '—';
		return new Date(epoch * 1000).toLocaleString('pt-BR');
	}
</script>

<div class="mb-4 flex items-center justify-between">
	<div>
		<h1 class="text-xl font-semibold">Secrets</h1>
		<p class="text-sm" style="color: var(--mc-text-muted);">
			Segredos armazenados no Key Vault Emulator.
		</p>
	</div>
	<button
		class="rounded px-4 py-1.5 text-sm font-medium text-white"
		style="background: var(--mc-blue);"
		onclick={() => (showCreate = !showCreate)}
	>
		+ Generate/Import
	</button>
</div>

{#if showCreate}
	<form
		method="POST"
		action="?/create"
		use:enhance={() =>
			({ update }) => {
				showCreate = false;
				update();
			}}
		class="mb-6 max-w-lg space-y-3 rounded border p-4"
		style="background: var(--mc-surface); border-color: var(--mc-border);"
	>
		<h2 class="font-medium">Criar secret</h2>
		<label class="block text-sm">
			Nome
			<input
				name="name"
				required
				class="mt-1 block w-full rounded border px-2 py-1.5 text-sm"
				style="border-color: var(--mc-border);"
			/>
		</label>
		<label class="block text-sm">
			Valor
			<textarea
				name="value"
				required
				rows="3"
				class="mt-1 block w-full rounded border px-2 py-1.5 text-sm"
				style="border-color: var(--mc-border);"
			></textarea>
		</label>
		{#if form?.error}
			<p class="text-sm text-red-600">{form.error}</p>
		{/if}
		<div class="flex gap-2">
			<button
				type="submit"
				class="rounded px-3 py-1.5 text-sm font-medium text-white"
				style="background: var(--mc-blue);"
			>
				Criar
			</button>
			<button
				type="button"
				class="rounded border px-3 py-1.5 text-sm"
				style="border-color: var(--mc-border);"
				onclick={() => (showCreate = false)}
			>
				Cancelar
			</button>
		</div>
	</form>
{/if}

<div class="overflow-hidden rounded border" style="background: var(--mc-surface); border-color: var(--mc-border);">
	<table class="w-full text-sm">
		<thead style="background: var(--mc-bg);">
			<tr class="text-left" style="color: var(--mc-text-muted);">
				<th class="px-3 py-2 font-medium">Name</th>
				<th class="px-3 py-2 font-medium">Status</th>
				<th class="px-3 py-2 font-medium">Updated</th>
				<th class="px-3 py-2 font-medium">Expiration</th>
				<th class="px-3 py-2"></th>
			</tr>
		</thead>
		<tbody>
			{#each data.secrets as secret (secret.id)}
				<tr class="border-t" style="border-color: var(--mc-border);">
					<td class="px-3 py-2">
						<a href={`/secrets/${secret.name}`} style="color: var(--mc-blue);">{secret.name}</a>
					</td>
					<td class="px-3 py-2">
						{#if secret.attributes?.enabled}
							<span class="text-green-700">Enabled</span>
						{:else}
							<span style="color: var(--mc-text-muted);">Disabled</span>
						{/if}
					</td>
					<td class="px-3 py-2">{fmt(secret.attributes?.updated)}</td>
					<td class="px-3 py-2">{fmt(secret.attributes?.expires)}</td>
					<td class="px-3 py-2 text-right">
						<form method="POST" action="?/delete" use:enhance>
							<input type="hidden" name="name" value={secret.name} />
							<button class="text-sm" style="color: #a4262c;">Delete</button>
						</form>
					</td>
				</tr>
			{:else}
				<tr>
					<td colspan="5" class="px-3 py-6 text-center" style="color: var(--mc-text-muted);">
						Nenhum secret encontrado.
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
