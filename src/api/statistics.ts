import { Hono } from 'hono';
import { getDb } from '../db';
import { getStatistics } from '../db/repositories/statistics';

const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
	const db = getDb(c.env.DB);

	const stats = await getStatistics(db);

	return c.json({ stats }, 200);
});

export default app;
