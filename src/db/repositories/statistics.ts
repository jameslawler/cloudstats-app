import { DrizzleClient } from '..';

import * as schema from '../schema';
import { StatisticType } from '../../types/statistic';
import { sql, eq, and, ne } from 'drizzle-orm';

export const getStatistics = async (db: DrizzleClient, siteId: string) =>
	db.select().from(schema.statistics).where(eq(schema.statistics.siteId, siteId)).all();

export const getDomainStatistic = async (db: DrizzleClient, siteId: string) =>
	db
		.select()
		.from(schema.statistics)
		.where(and(eq(schema.statistics.siteId, siteId), eq(schema.statistics.type, 'visit'), eq(schema.statistics.actionName, 'domain')))
		.limit(1);

export const getTopTenStatistic = async (db: DrizzleClient, siteId: string, type: StatisticType) =>
	db
		.select()
		.from(schema.statistics)
		.where(and(eq(schema.statistics.siteId, siteId), eq(schema.statistics.type, type), ne(schema.statistics.actionName, 'domain')))
		.orderBy(
			sql`
					COALESCE(json_extract(${schema.statistics.overallCounts}, '$.total'), 0) DESC
				`,
		)
		.limit(10);

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

export const updateStatistic = async (
	db: DrizzleClient,
	siteId: string,
	type: StatisticType,
	actionName: string,
	actionValue: string,
	overallCounts: any,
) => {
	const existing = await db
		.select()
		.from(schema.statistics)
		.where(
			and(
				eq(schema.statistics.siteId, siteId),
				eq(schema.statistics.type, type),
				eq(schema.statistics.actionName, actionName),
				eq(schema.statistics.actionValue, actionValue),
			),
		);

	let existingTotal = 0;
	let existingMarch = {};

	if (existing.length === 1) {
		const existingOverallCounts = existing[0].overallCounts;

		console.log(existingOverallCounts);

		existingTotal = existingOverallCounts.total;
		existingMarch = existingOverallCounts.years['2026'].months;
	}

	console.log('total', existingTotal);

	const newOverallCounts = {
		total: existingTotal + overallCounts.total,
		years: {
			...(overallCounts?.years || {}),
			['2026']: {
				months: {
					...(overallCounts?.years['2026']?.months || {}),
					...existingMarch,
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
			overallCounts,
			countryCounts: {},
			refererCounts: {},
			createdAt: Date.now(),
			updatedAt: Date.now(),
		})
		.onConflictDoUpdate({
			target: [schema.statistics.siteId, schema.statistics.type, schema.statistics.actionName, schema.statistics.actionValue],
			set: {
				overallCounts: newOverallCounts,
				updatedAt: Date.now(),
			},
		});
};
