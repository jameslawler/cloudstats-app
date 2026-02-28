import { Hono } from 'hono';
import { getDb } from '../db';
import { incrementStatistic } from '../db/repositories/statistics';

const app = new Hono<{ Bindings: Env }>();

const pixel = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wIAAgUBAcxVYwAAAABJRU5ErkJggg=='), (c) =>
	c.charCodeAt(0),
);

const getRefererDomain = (referer?: string | null): string => {
	if (!referer) {
		return 'none';
	}

	try {
		const url = new URL(referer);
		return url.hostname.startsWith('www.') ? url.hostname.slice(4) : url.hostname;
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
	const countryCode = c.req.header()['CF-IPCountry'] ?? 'none';
	const referer = c.req.header()['referer'] ?? 'none';

	const refererDomain = getRefererDomain(referer);
	const actionValue = getRefererWithoutQuery(referer);

	if (actionValue === 'none' || !siteIds.includes(refererDomain.toLowerCase())) {
		return new Response(pixel, {
			headers: {
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
	const countryCode = c.req.header()['CF-IPCountry'] ?? 'none';
	const referer = c.req.header()['referer'] ?? 'none';

	const refererDomain = getRefererDomain(referer);

	if (!siteIds.includes(refererDomain.toLowerCase())) {
		return new Response(pixel, {
			headers: {
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
			'Content-Type': 'image/png',
			'Content-Length': pixel.length.toString(),
			'Cache-Control': 'public, max-age=60',
		},
	});
});

export default app;
