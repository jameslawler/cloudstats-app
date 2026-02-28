import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
import { StatisticType } from '../../types/statistic';

export const statistics = sqliteTable(
	'statistics',
	{
		id: text('id').primaryKey(),
		siteId: text('siteId').notNull(),
		type: text('type').notNull().$type<StatisticType>(),
		actionName: text('actionName').notNull(), // download, article, blog, news, singup, login
		actionValue: text('actionValue').notNull(), // http://www.., http://, http://
		overallCounts: text('overallCounts', { mode: 'json' }).notNull(),
		countryCounts: text('countryCounts', { mode: 'json' }).notNull(),
		refererCounts: text('refererCounts', { mode: 'json' }).notNull(),
		createdAt: integer('createdAt').notNull(),
		updatedAt: integer('updatedAt').notNull(),
	},
	(table) => [unique('siteIdTypeActionNameActionValueUnique').on(table.siteId, table.type, table.actionName, table.actionValue)],
);
