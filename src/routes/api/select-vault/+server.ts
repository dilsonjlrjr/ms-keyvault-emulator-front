import type { RequestHandler } from './$types';

// Seta o cookie do vault selecionado e responde 204 (sem redirect). O cliente
// (layout) chama invalidateAll() depois para revalidar os loads com o vault novo.
// Não usamos redirect aqui: ele gerava um GET seguinte cancelado e deixava a
// aplicação do cookie ambígua antes do invalidateAll.
export const POST: RequestHandler = async ({ request, cookies }) => {
	const data = await request.formData();
	const vault = data.get('vault')?.toString() || '';

	cookies.set('selected_vault', vault, {
		path: '/',
		maxAge: 60 * 60 * 24 * 365,
		httpOnly: true,
		sameSite: 'lax'
	});

	return new Response(null, { status: 204 });
};
