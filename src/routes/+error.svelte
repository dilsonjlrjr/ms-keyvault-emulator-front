<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="flex min-h-[60vh] items-center justify-center p-6">
	<div class="animate-fade-in card max-w-md p-8 text-center">
		<div class="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl" style="background: var(--danger-subtle);">
			<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="10"/>
				<line x1="12" y1="8" x2="12" y2="12"/>
				<line x1="12" y1="16" x2="12.01" y2="16"/>
			</svg>
		</div>
		<h1 class="text-lg font-semibold" style="color: var(--text-primary);">{page.status}</h1>
		<p class="mt-2 text-sm" style="color: var(--text-muted);">{page.error?.message || 'An unexpected error occurred.'}</p>
		<p class="mt-4 text-xs" style="color: var(--text-muted);">
			Verify the emulator is running and <code>KEYVAULT_EMULATOR_URL</code> is correct.
		</p>
		<a href="/secrets" class="btn btn-secondary mt-6 inline-flex">Go to Secrets</a>
	</div>
</div>
