<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let reveal = $state(false);
	let copied = $state(false);

	async function copyValue() {
		if (!data.secret.value) return;
		await navigator.clipboard.writeText(data.secret.value);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<a href="/secrets" class="link mb-4 inline-flex items-center gap-1 text-sm">
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
	</svg>
	Back to Secrets
</a>

<h1 class="page-title mt-2 mb-5">{data.secret.name}</h1>

<div class="grid gap-4" style="max-width: 42rem;">
	<!-- Secret Identifier -->
	<div class="card">
		<div class="card-header">
			<span class="text-xs font-medium" style="color: var(--text-muted);">Secret Identifier</span>
		</div>
		<div class="card-body">
			<p class="mono break-all text-xs leading-relaxed" style="background: transparent; padding: 0;">{data.secret.id}</p>
		</div>
	</div>

	<!-- Value -->
	<div class="card">
		<div class="card-header">
			<span class="text-xs font-medium" style="color: var(--text-muted);">Value</span>
			<div class="flex items-center gap-1.5">
				{#if data.secret.value}
					<button class="btn btn-ghost btn-sm" onclick={copyValue}>
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
						</svg>
						{copied ? 'Copied' : 'Copy'}
					</button>
				{/if}
				<button class="btn btn-ghost btn-sm" onclick={() => (reveal = !reveal)}>
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						{#if reveal}
							<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
							<line x1="1" y1="1" x2="23" y2="23"/>
						{:else}
							<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
						{/if}
					</svg>
					{reveal ? 'Hide' : 'Reveal'}
				</button>
			</div>
		</div>
		<div class="card-body">
			<code class="mono block break-all rounded p-3 text-sm leading-relaxed" style="background: var(--bg-input); padding: 0.75rem;">
				{#if reveal}
					{data.secret.value || ''}
				{:else}
					<span style="color: var(--text-muted);">••••••••••••••••••••</span>
				{/if}
			</code>
		</div>
	</div>

	<!-- Metadata -->
	<div class="card">
		<div class="card-header">
			<span class="text-xs font-medium" style="color: var(--text-muted);">Metadata</span>
		</div>
		<div class="card-body">
			<div class="grid grid-cols-2 gap-4 text-sm">
				<div>
					<p class="text-xs" style="color: var(--text-muted);">Content Type</p>
					<p class="mt-0.5 font-medium">{data.secret.contentType || '—'}</p>
				</div>
				<div>
					<p class="text-xs" style="color: var(--text-muted);">Status</p>
					<p class="mt-0.5">
						{#if data.secret.attributes?.enabled}
							<span class="badge badge-success">Enabled</span>
						{:else}
							<span class="badge badge-danger">Disabled</span>
						{/if}
					</p>
				</div>
				{#if data.secret.attributes?.created}
					<div>
						<p class="text-xs" style="color: var(--text-muted);">Created</p>
						<p class="mt-0.5 font-medium" style="color: var(--text-secondary);">
							{new Date(data.secret.attributes.created * 1000).toLocaleDateString('en-US', {
								month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
							})}
						</p>
					</div>
				{/if}
				{#if data.secret.attributes?.updated}
					<div>
						<p class="text-xs" style="color: var(--text-muted);">Updated</p>
						<p class="mt-0.5 font-medium" style="color: var(--text-secondary);">
							{new Date(data.secret.attributes.updated * 1000).toLocaleDateString('en-US', {
								month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
							})}
						</p>
					</div>
				{/if}
				{#if data.secret.attributes?.expires}
					<div>
						<p class="text-xs" style="color: var(--text-muted);">Expires</p>
						<p class="mt-0.5 font-medium" style="color: var(--warning);">
							{new Date(data.secret.attributes.expires * 1000).toLocaleDateString('en-US', {
								month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
							})}
						</p>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Delete -->
	<div class="card" style="border-color: rgba(248, 113, 113, 0.15);">
		<div class="card-header" style="border-color: rgba(248, 113, 113, 0.10);">
			<span class="text-xs font-medium" style="color: var(--danger);">Danger Zone</span>
		</div>
		<div class="card-body flex items-center justify-between">
			<div>
				<p class="text-sm font-medium" style="color: var(--text-primary);">Delete this secret</p>
				<p class="text-xs" style="color: var(--text-muted);">This action cannot be undone.</p>
			</div>
			<form method="POST" action="?/delete" use:enhance>
				<button class="btn btn-danger">Delete Secret</button>
			</form>
		</div>
	</div>
</div>
