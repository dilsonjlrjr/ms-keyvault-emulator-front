<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let reveal = $state(false);
</script>

<a href="/secrets" class="text-sm" style="color: var(--mc-blue);">&larr; Secrets</a>

<h1 class="mt-2 mb-4 text-xl font-semibold">{data.secret.name}</h1>

<div
	class="max-w-xl space-y-3 rounded border p-4 text-sm"
	style="background: var(--mc-surface); border-color: var(--mc-border);"
>
	<div>
		<p class="font-medium" style="color: var(--mc-text-muted);">Secret identifier</p>
		<p class="break-all">{data.secret.id}</p>
	</div>

	<div>
		<p class="font-medium" style="color: var(--mc-text-muted);">Value</p>
		<div class="flex items-center gap-2">
			<code class="break-all rounded bg-gray-100 px-2 py-1">
				{reveal ? data.secret.value : '••••••••••••'}
			</code>
			<button class="text-xs" style="color: var(--mc-blue);" onclick={() => (reveal = !reveal)}>
				{reveal ? 'Ocultar' : 'Mostrar'}
			</button>
		</div>
	</div>

	<div>
		<p class="font-medium" style="color: var(--mc-text-muted);">Content type</p>
		<p>{data.secret.contentType ?? '—'}</p>
	</div>

	<div>
		<p class="font-medium" style="color: var(--mc-text-muted);">Status</p>
		<p>{data.secret.attributes?.enabled ? 'Enabled' : 'Disabled'}</p>
	</div>
</div>

<form method="POST" action="?/delete" use:enhance class="mt-4">
	<button class="rounded border px-3 py-1.5 text-sm" style="border-color: #a4262c; color: #a4262c;">
		Delete secret
	</button>
</form>
