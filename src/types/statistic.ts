export type StatisticType = 'visit' | 'event';

export type StatisticCounts = {
	total: number;
	years: Record<
		string,
		{
			months: Record<string, number>;
		}
	>;
};

export type Statistic = {
	id: string;
	siteId: string;
	type: StatisticType;
	actionName: string;
	actionValue: string;
	overallCounts: StatisticCounts;
	countryCounts: Record<string, StatisticCounts>;
	refererCounts: Record<string, StatisticCounts>;
};
