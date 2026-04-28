import { Hono } from 'hono';
import { getDb } from '../db';
import { getDomainStatistic, getTopTenStatistic } from '../db/repositories/statistics';
import Dashboard from '../pages/dashboard';

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

	const stats = await getDomainStatistic(db, siteId);
	const topTen = await getTopTenStatistic(db, siteId, 'visit', 'article');

	return c.html(<Dashboard domainTotalVisits={stats[0]?.overallCounts?.total ?? 0} topTen={topTen} />);
});

export default app;
