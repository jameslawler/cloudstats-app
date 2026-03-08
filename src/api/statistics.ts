import { Hono } from 'hono';
import { getDb } from '../db';
import { getStatistics } from '../db/repositories/statistics';

const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
	const db = getDb(c.env.DB);
	const url = new URL(c.req.url);
	const siteId = url.hostname;

	const stats = await getStatistics(db, siteId);

	return c.json({ stats }, 200);
});

export default app;
