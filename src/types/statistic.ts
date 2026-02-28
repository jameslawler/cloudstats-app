export type StatisticType = 'visit' | 'event';

export type Statistic = {
	id: string;
	siteId: string;
	type: StatisticType;
	actionName: string;
	actionValue: string;
	overallCounts: string;
	countryCounts: string;
	refererCounts: string;
};
