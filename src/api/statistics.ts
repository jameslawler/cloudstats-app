import { Hono } from 'hono';
import { getDb } from '../db';
import { getStatistics } from '../db/repositories/statistics';

const app = new Hono<{ Bindings: Env }>();

const getSiteId = (requestUrl: string) => {
	const redundantSubDomains = ['s.', 'www.'];
	const url = new URL(requestUrl);

	for (const subDomain of redundantSubDomains) {
		if (url.hostname.startsWith(subDomain)) {
			return url.hostname.slice(subDomain.length);
		}
	}

	return url.hostname;
};

app.get('/', async (c) => {
	const db = getDb(c.env.DB);
	const siteId = getSiteId(c.req.url);

	const stats = await getStatistics(db, siteId);

	return c.json({ stats }, 200);
});

export default app;
