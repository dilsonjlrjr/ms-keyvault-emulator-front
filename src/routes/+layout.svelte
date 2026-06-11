<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import { t, type Lang } from '$lib/i18n';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

	const _ = (key: string) => t(key, page.data.lang as string || 'en');

	const headerTitle = $derived(`${_('bar.title')} — ${data.vaultTitle}`);

	const nav = [
		{ href: '/secrets', label: 'nav.secrets', icon: 'key' },
		{ href: '/keys', label: 'nav.keys', icon: 'shield' },
		{ href: '/certificates', label: 'nav.certificates', icon: 'badge' },
		{ href: '/integrations', label: 'nav.integrations', icon: 'plug' }
	] as const;

	const iconPaths: Record<string, string> = {
		key: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
		shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
		badge: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
		plug: 'M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z'
	};

	const langOptions: { code: Lang; label: string; flag: string }[] = [
		{ code: 'en', label: 'EN', flag: '🇺🇸' },
		{ code: 'pt', label: 'PT', flag: '🇧🇷' },
		{ code: 'es', label: 'ES', flag: '🇪🇸' }
	];

	async function onVaultChange(e: Event) {
		const vault = (e.target as HTMLSelectElement).value;
		if (vault === data.selectedVault) return;
		await fetch('/api/select-vault', {
			method: 'POST',
			redirect: 'manual',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({ vault }).toString()
		});
		await goto(page.url.pathname + page.url.search, { invalidateAll: true, keepFocus: true });
	}

	async function changeLang(l: Lang) {
		document.cookie = `lang=${l}; path=/; max-age=31536000; SameSite=Lax`;
		window.location.reload();
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{headerTitle}</title>
</svelte:head>

<div class="flex h-screen overflow-hidden" style="background: var(--bg-root);">
	<!-- Sidebar -->
	<aside
		class="flex w-[--sidebar-w] shrink-0 flex-col border-r"
		style="background: var(--bg-surface); border-color: var(--border-subtle);"
	>
		<!-- Logo / brand -->
		<div class="flex items-center gap-2.5 border-b px-4 py-3.5" style="border-color: var(--border-subtle);">
			<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md" style="background: var(--accent-subtle);">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
				</svg>
			</div>
			<div class="min-w-0">
				<p class="truncate text-sm font-semibold" style="color: var(--text-primary);">kvemu</p>
			</div>
		</div>

		<!-- Navigation -->
		<nav class="flex-1 space-y-0.5 overflow-y-auto p-3">
			<p class="px-2 pb-2 pt-1 text-[0.625rem] font-semibold uppercase tracking-wider" style="color: var(--text-muted);">
				{_('nav.objects')}
			</p>
			{#each nav as item (item.href)}
				{@const active = page.url.pathname === item.href || page.url.pathname.startsWith(item.href + '/')}
				<a
					href={item.href}
					class="nav-item"
					class:active
				>
					<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d={iconPaths[item.icon]} />
					</svg>
					{_(item.label)}
				</a>
			{/each}
		</nav>

		<!-- Footer -->
		<div class="border-t p-3" style="border-color: var(--border-subtle);">
			<a href="/vaults" class="nav-item text-[0.75rem]">
				<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
					<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
				</svg>
				{_('nav.manage_vaults')}
			</a>
		</div>
	</aside>

	<!-- Main area -->
	<div class="flex flex-1 flex-col overflow-hidden">
		<!-- Top bar -->
		<header
			class="flex h-11 shrink-0 items-center gap-3 border-b px-4"
			style="background: var(--bg-surface); border-color: var(--border-subtle);"
		>
			<span class="rounded-full px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wider" style="background: var(--success-subtle); color: var(--success);">
				{_('bar.local')}
			</span>

			<div class="ml-auto flex items-center gap-2">
				{#if data.vaults.length > 0}
					<select
						name="vault"
						value={data.selectedVault}
						class="input py-1 pr-6 text-xs"
						style="width: auto;"
						onchange={onVaultChange}
					>
						{#each data.vaults as vault (vault.name)}
							<option value={vault.name}>
								{vault.displayName || vault.name}
							</option>
						{/each}
					</select>
				{/if}

				<div class="flex items-center rounded-lg border p-0.5" style="border-color: var(--border-default);">
					{#each langOptions as opt}
						<button
							class="rounded px-1.5 py-0.5 text-[0.625rem] font-semibold transition-all"
							class:btn-primary={data.lang === opt.code}
							class:btn-ghost={data.lang !== opt.code}
							style={data.lang === opt.code ? 'padding: 0.125rem 0.375rem; font-size: 0.625rem;' : 'border: none; padding: 0.125rem 0.375rem; font-size: 0.625rem;'}
							onclick={() => changeLang(opt.code)}
						>
							{opt.label}
						</button>
					{/each}
				</div>
			</div>
		</header>

		<!-- Content -->
		<main class="flex-1 overflow-y-auto p-6">
			{@render children()}
		</main>
	</div>
</div>
