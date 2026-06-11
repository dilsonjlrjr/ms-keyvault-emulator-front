import fs from 'node:fs';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const CA_PATH = process.env.KV_CA_FILE ?? '/certs/ca.pem';

export const GET: RequestHandler = () => {
	try {
		const pem = fs.readFileSync(CA_PATH, 'utf-8');
		return new Response(pem, {
			status: 200,
			headers: {
				'Content-Type': 'application/x-pem-file',
				'Content-Disposition': 'attachment; filename="ca.pem"'
			}
		});
	} catch {
		error(503, 'CA certificate not available. Run: docker cp kvemu:/certs/ca.pem ./ca.pem');
	}
};
