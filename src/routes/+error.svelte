<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="flex min-h-[60vh] items-center justify-center p-6">
	<div
		class="max-w-lg rounded border p-6 text-center"
		style="background: var(--mc-surface); border-color: var(--mc-border);"
	>
		<p class="text-3xl">⚠️</p>
		<h1 class="mt-2 text-lg font-semibold">{page.status}</h1>
		<p class="mt-1 text-sm" style="color: var(--mc-text-muted);">{page.error?.message}</p>
		<p class="mt-4 text-xs" style="color: var(--mc-text-muted);">
			Verifique se o emulador está em execução e se a variável <code>KEYVAULT_EMULATOR_URL</code>
			aponta para o endereço correto.
		</p>
	</div>
</div>
