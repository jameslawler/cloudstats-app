import { Hono } from 'hono';
import { getDb } from '../db';
import { incrementStatistic } from '../db/repositories/statistics';

const app = new Hono<{ Bindings: Env }>();

const pixel = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wIAAgUBAcxVYwAAAABJRU5ErkJggg=='), (c) =>
	c.charCodeAt(0),
);

const getRefererDomain = (referer?: string | null): string => {
	const redundantSubDomains = ['s.', 'www.'];

	if (!referer) {
		return 'none';
	}

	try {
		const url = new URL(referer);

		for (const subDomain of redundantSubDomains) {
			if (url.hostname.startsWith(subDomain)) {
				return url.hostname.slice(subDomain.length);
			}
		}

		return url.hostname;
	} catch {
		return 'none';
	}
};

const getRefererWithoutQuery = (referer?: string | null): string => {
	if (!referer) {
		return 'none';
	}

	try {
		const url = new URL(referer);
		return `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}${url.pathname}`;
	} catch {
		return 'none';
	}
};

app.get('/site/:actionName/image.png', async (c) => {
	const db = getDb(c.env.DB);
	const siteIds = JSON.parse(c.env.SITE_IDS) as string[];

	const actionName = c.req.param('actionName');
	const source = c.req.query('s') ?? 'none';
	const actionValue = c.req.query('u') ?? 'none';
	const countryCode = c.req.header('cf-ipcountry')?.toLowerCase() ?? 'none';
	const referer = c.req.header('referer') ?? 'none';
	const refererDomain = getRefererDomain(referer);

	if (actionValue === 'none' || !siteIds.includes(refererDomain.toLowerCase())) {
		return new Response(pixel, {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Content-Type': 'image/png',
				'Content-Length': pixel.length.toString(),
				'Cache-Control': 'public, max-age=60',
			},
		});
	}

	const siteId = refererDomain.toLowerCase();

	await incrementStatistic(db, siteId, 'visit', actionName, actionValue, countryCode.toLowerCase(), source);

	return new Response(pixel, {
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Content-Type': 'image/png',
			'Content-Length': pixel.length.toString(),
			'Cache-Control': 'public, max-age=60',
		},
	});
});

app.get('/site/image.png', async (c) => {
	const db = getDb(c.env.DB);
	const siteIds = JSON.parse(c.env.SITE_IDS) as string[];

	const source = c.req.query('s') ?? 'none';
	const countryCode = c.req.header('cf-ipcountry')?.toLowerCase() ?? 'none';
	const referer = c.req.header('referer') ?? 'none';

	const refererDomain = getRefererDomain(referer);

	if (!siteIds.includes(refererDomain.toLowerCase())) {
		return new Response(pixel, {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Content-Type': 'image/png',
				'Content-Length': pixel.length.toString(),
				'Cache-Control': 'public, max-age=60',
			},
		});
	}

	const siteId = refererDomain.toLowerCase();

	await incrementStatistic(db, siteId, 'visit', 'domain', refererDomain, countryCode.toLowerCase(), source);

	return new Response(pixel, {
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Content-Type': 'image/png',
			'Content-Length': pixel.length.toString(),
			'Cache-Control': 'public, max-age=60',
		},
	});
});

export default app;
