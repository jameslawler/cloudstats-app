import { Hono } from 'hono';
import { getDb } from '../db';
import { getDomainStatistic, getTopTenStatistic, StatisticsRange } from '../db/repositories/statistics';
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
	const year = c.req.query('y');
	const month = c.req.query('m');
	const isOverallRange = !year && !month;

	const statisticsRange: StatisticsRange = isOverallRange ? { type: 'overall' } : { type: 'date', year, month };

	const domainStatistics = await getDomainStatistic(db, siteId);
	const visitStatistics = await getTopTenStatistic(db, siteId, 'visit', statisticsRange);
	const eventStatistics = await getTopTenStatistic(db, siteId, 'event', statisticsRange);

	if (domainStatistics.length === 0) {
		return c.html('<div>Error</div>');
	}

	return c.html(
		'<!doctype html>' +
		(
			<Dashboard
				siteId={siteId}
				domainStatistic={domainStatistics[0]}
				visitStatistics={visitStatistics}
				eventStatistics={eventStatistics}
				statisticsRange={statisticsRange}
			/>
		),
	);
});

export default app;
