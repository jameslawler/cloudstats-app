import { Hono } from 'hono';
import { getDb } from '../db';
import { incrementStatistic } from '../db/repositories/statistics';

const app = new Hono<{ Bindings: Env }>();

app.post('/', async (c) => {
	const db = getDb(c.env.DB);
	const data = await c.req.json();
	const siteIds = JSON.parse(c.env.SITE_IDS) as string[];
	const { siteId, actionName, actionValue, countryCode, source } = data;
	const apiSecret = c.req.header('x-api-key') ?? 'none';

	console.log('headers', JSON.stringify(Object.fromEntries(c.req.raw.headers)));
	console.log('api: ', c.req.header('x-api-key'));

	if (apiSecret !== c.env.EVENT_SECRET) {
		console.log('Bad auth: ', apiSecret);
		return c.body(null, 401);
	}

	if (!siteIds.includes(siteId.toLowerCase())) {
		return c.body(null, 400);
	}

	await incrementStatistic(db, siteId, 'event', actionName, actionValue, countryCode.toLowerCase(), source);

	return c.body(null, 200);
});

export default app;
