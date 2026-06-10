<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

	const headerTitle = $derived(`Key Vault Emulator - ${data.vaultTitle}`);

	const nav = [
		{ href: '/secrets', label: 'Secrets' },
		{ href: '/keys', label: 'Keys' },
		{ href: '/certificates', label: 'Certificates' }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{headerTitle}</title>
</svelte:head>

<div class="flex min-h-screen flex-col">
	<header
		class="flex h-12 items-center gap-3 px-4 text-white"
		style="background: var(--mc-blue-dark);"
	>
		<span class="text-lg">🔑</span>
		<span class="font-semibold">Key Vault Emulator</span>
		<span class="text-white/60">-</span>
		<span class="font-medium">{data.vaultTitle}</span>
		<span class="ml-1 rounded bg-white/15 px-2 py-0.5 text-xs">local</span>
	</header>

	<div class="flex flex-1">
		<nav
			class="w-56 shrink-0 border-r p-3"
			style="background: var(--mc-surface); border-color: var(--mc-border);"
		>
			<p class="px-2 pb-2 text-xs font-semibold tracking-wide uppercase" style="color: var(--mc-text-muted);">
				Objects
			</p>
			<ul class="space-y-0.5">
				{#each nav as item (item.href)}
					{@const active = page.url.pathname.startsWith(item.href)}
					<li>
						<a
							href={item.href}
							class="block rounded px-2 py-1.5 text-sm transition-colors"
							class:font-semibold={active}
							style={active
								? 'background: #e8f1fb; color: var(--mc-blue);'
								: 'color: var(--mc-text);'}
						>
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<main class="flex-1 p-6">
			{@render children()}
		</main>
	</div>
</div>
