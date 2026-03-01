import { DrizzleClient } from '..';

import * as schema from '../schema';
import { StatisticType } from '../../types/statistic';
import { sql } from 'drizzle-orm';

export const getStatistics = async (db: DrizzleClient) => db.select().from(schema.statistics).all();

export const incrementStatistic = async (
	db: DrizzleClient,
	siteId: string,
	type: StatisticType,
	actionName: string,
	actionValue: string,
	countryCode: string,
	refererDomain: string,
) => {
	const now = new Date();
	const year = now.getFullYear();
	const month = now.toLocaleString('en-US', { month: 'short' }).toLowerCase();

	refererDomain = refererDomain.replaceAll('.', '_');

	const overallCountsYearPath = `$.years.${year}.months.${month}`;
	const countryCountsTotalPath = `$.${countryCode}.total`;
	const countryCountsYearPath = `$.${countryCode}.years.${year}.months.${month}`;
	const refererCountsTotalPath = `$.${refererDomain}.total`;
	const refererCountsYearPath = `$.${refererDomain}.years.${year}.months.${month}`;

	const insertJson = {
		total: 1,
		years: {
			[year]: {
				months: {
					[month]: 1,
				},
			},
		},
	};

	await db
		.insert(schema.statistics)
		.values({
			id: crypto.randomUUID(),
			siteId,
			type,
			actionName,
			actionValue,
			overallCounts: insertJson,
			countryCounts: {
				[countryCode]: insertJson,
			},
			refererCounts: {
				[refererDomain]: insertJson,
			},
			createdAt: Date.now(),
			updatedAt: Date.now(),
		})
		.onConflictDoUpdate({
			target: [schema.statistics.siteId, schema.statistics.type, schema.statistics.actionName, schema.statistics.actionValue],
			set: {
				overallCounts: sql`
					json_set(
						${schema.statistics.overallCounts},
						'$.total',
						COALESCE(json_extract(${schema.statistics.overallCounts}, '$.total'), 0) + 1,
						${overallCountsYearPath},
						COALESCE(json_extract(${schema.statistics.overallCounts}, ${overallCountsYearPath}), 0) + 1
					)
				`,
				countryCounts: sql`
					json_set(
						${schema.statistics.countryCounts},
						${countryCountsTotalPath},
						COALESCE(json_extract(${schema.statistics.countryCounts}, ${countryCountsTotalPath}), 0) + 1,
						${countryCountsYearPath},
						COALESCE(json_extract(${schema.statistics.countryCounts}, ${countryCountsYearPath}), 0) + 1
					)
				`,
				refererCounts: sql`
					json_set(
						${schema.statistics.refererCounts},
						${refererCountsTotalPath},
						COALESCE(json_extract(${schema.statistics.refererCounts}, ${refererCountsTotalPath}), 0) + 1,
						${refererCountsYearPath},
						COALESCE(json_extract(${schema.statistics.refererCounts}, ${refererCountsYearPath}), 0) + 1
					)
				`,
				updatedAt: Date.now(),
			},
		});
};
