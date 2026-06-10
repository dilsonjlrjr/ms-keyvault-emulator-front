<script lang="ts">
	import type { ActionData } from './$types';
	import { enhance } from '$app/forms';

	let { form }: { form: ActionData } = $props();
	let fileName = $state('');
	let preview = $state<any>(null);

	function handleFile(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		fileName = file.name;

		const reader = new FileReader();
		reader.onload = () => {
			try {
				preview = JSON.parse(reader.result as string);
			} catch {
				preview = null;
			}
		};
		reader.readAsText(file);
	}
</script>

<div class="mx-auto" style="max-width: 36rem;">
	<div class="mb-6">
		<a href="/vaults" class="link inline-flex items-center gap-1 text-sm">
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
			</svg>
			Back to Vaults
		</a>
	</div>

	<h1 class="page-title mb-5">Import Vault</h1>

	{#if form?.error}
		<div class="form-msg form-msg-error mb-4">{form.error}</div>
	{/if}

	{#if form?.success && form?.result}
		<div class="animate-fade-in card mb-5" style="border-color: rgba(74, 222, 128, 0.15);">
			<div class="card-header" style="border-color: rgba(74, 222, 128, 0.08);">
				<div class="flex items-center gap-2">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
					</svg>
					<span class="text-sm font-semibold" style="color: var(--success);">Import Successful</span>
				</div>
			</div>
			<div class="card-body">
				<p class="text-sm" style="color: var(--text-primary);">
					Vault <span class="mono" style="background: transparent; padding: 0;">{form.result.vault}</span> imported successfully.
				</p>
				<div class="mt-3 grid grid-cols-3 gap-3">
					<div class="rounded-md p-3 text-center" style="background: var(--bg-elevated);">
						<p class="text-lg font-bold mono" style="color: var(--success);">{form.result.secrets_created}</p>
						<p class="text-[0.625rem] uppercase tracking-wider" style="color: var(--text-muted);">Secrets</p>
						{#if form.result.secrets_skipped > 0}
							<p class="mt-0.5 text-[0.625rem]" style="color: var(--text-muted);">{form.result.secrets_skipped} skipped</p>
						{/if}
					</div>
					<div class="rounded-md p-3 text-center" style="background: var(--bg-elevated);">
						<p class="text-lg font-bold mono" style="color: var(--info);">{form.result.keys_created}</p>
						<p class="text-[0.625rem] uppercase tracking-wider" style="color: var(--text-muted);">Keys</p>
						{#if form.result.keys_skipped > 0}
							<p class="mt-0.5 text-[0.625rem]" style="color: var(--text-muted);">{form.result.keys_skipped} skipped</p>
						{/if}
					</div>
					<div class="rounded-md p-3 text-center" style="background: var(--bg-elevated);">
						<p class="text-lg font-bold mono" style="color: var(--warning);">{form.result.certs_created}</p>
						<p class="text-[0.625rem] uppercase tracking-wider" style="color: var(--text-muted);">Certs</p>
						{#if form.result.certs_skipped > 0}
							<p class="mt-0.5 text-[0.625rem]" style="color: var(--text-muted);">{form.result.certs_skipped} skipped</p>
						{/if}
					</div>
				</div>
				<a href="/vaults" class="btn btn-secondary mt-4 inline-flex">View all vaults</a>
			</div>
		</div>
	{:else}
		<form
			method="POST"
			action="?/import"
			use:enhance
			class="card"
		>
			<div class="card-body space-y-4">
				<!-- Drop zone -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors"
					style="border-color: var(--border-default);"
					onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
					onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-default)'; }}
				>
					<input
						type="file"
						name="file"
						accept=".json"
						onchange={handleFile}
						class="hidden"
						id="file-input"
					/>
					<label for="file-input" class="cursor-pointer">
						<div class="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl" style="background: var(--accent-subtle);">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
							</svg>
						</div>
						<p class="text-sm font-medium" style="color: var(--text-primary);">
							{fileName || 'Select a vault export file'}
						</p>
						<p class="mt-1 text-xs" style="color: var(--text-muted);">
							JSON files previously exported from kvemu
						</p>
					</label>
				</div>

				<!-- Preview -->
				{#if preview?.vault}
					<div class="card" style="background: var(--bg-elevated); border-color: var(--border-default);">
						<div class="card-body">
							<h3 class="mb-3 text-sm font-semibold" style="color: var(--text-primary);">
								Preview: {preview.vault.display_name || preview.vault.name}
							</h3>
							<div class="flex gap-4 text-xs" style="color: var(--text-secondary);">
								<span><span class="font-semibold mono" style="color: var(--success); background: transparent; padding: 0;">{preview.secrets?.length || 0}</span> Secrets</span>
								<span><span class="font-semibold mono" style="color: var(--info); background: transparent; padding: 0;">{preview.keys?.length || 0}</span> Keys</span>
								<span><span class="font-semibold mono" style="color: var(--warning); background: transparent; padding: 0;">{preview.certificates?.length || 0}</span> Certificates</span>
							</div>
						</div>
					</div>
				{/if}

				<button
					type="submit"
					disabled={!fileName}
					class="btn btn-primary w-full"
				>
					Import Vault
				</button>
			</div>
		</form>
	{/if}
</div>
