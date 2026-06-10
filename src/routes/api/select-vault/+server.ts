import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const data = await request.formData();
	const vault = data.get('vault')?.toString() || '';

	cookies.set('selected_vault', vault, {
		path: '/',
		maxAge: 60 * 60 * 24 * 365,
		httpOnly: true,
		sameSite: 'lax'
	});

	throw redirect(303, '/secrets');
};
