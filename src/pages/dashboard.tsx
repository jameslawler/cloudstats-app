import type { FC } from 'hono/jsx';
import { Statistic, StatisticCounts } from '../types/statistic';
import Layout from '../components/Layout';

const calculatePageWidth = (visitStatistics: Statistic[], pageStatistic: Statistic) => {
	const maxWidthPageStatistic = visitStatistics.reduce((acc, cur) => (acc = acc.overallCounts.total < cur.overallCounts.total ? cur : acc));

	return (pageStatistic.overallCounts.total / maxWidthPageStatistic.overallCounts.total) * 100;
};

const calculateWidth = (statisticCounts: StatisticCounts[], statisticCount: StatisticCounts) => {
	const maxWidthStatisticCount = statisticCounts.reduce((acc, cur) => (acc = acc.total < cur.total ? cur : acc));

	return (statisticCount.total / maxWidthStatisticCount.total) * 100;
};

const Dashboard: FC<{ siteId: string; domainStatistic: Statistic; visitStatistics: Statistic[]; eventStatistics: Statistic[] }> = (
	props,
) => {
	const domainTopCountries = Object.entries(props.domainStatistic.countryCounts)
		.sort(([, aValue], [, bValue]) => bValue.total - aValue.total)
		.slice(0, 10);

	const domainTopReferers = Object.entries(props.domainStatistic.refererCounts)
		.sort(([, aValue], [, bValue]) => bValue.total - aValue.total)
		.slice(0, 10);

	return (
		<Layout>
			<div class="flex flex-col gap-4 min-h-screen bg-gray-50 p-6">
				<div class="mb-6">
					<h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
					<p class="text-gray-500">{props.siteId}</p>
				</div>

				<div class="w-full flex flex-row gap-4">
					<div class="w-full bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
						<div class="p-3 border-b border-gray-100">
							<h2 class="text-md text-gray-400">Total Visits</h2>
							<div>{props.domainStatistic.overallCounts.total}</div>
						</div>
					</div>
				</div>

				<div class="w-full flex flex-row gap-4">
					<div class="w-full bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
						<div class="p-3 border-b border-gray-100">
							<h2 class="text-md text-gray-400">Country</h2>
						</div>

						<div class="divide-y divide-gray-100">
							{domainTopCountries.map(([key, value]) => (
								<div class="p-1 hover:bg-gray-50 transition">
									<div class="flex items-center justify-between">
										<div class="flex flex-1 w-full h-full relative p-1">
											<div
												class="absolute top-0 left-0 h-full bg-amber-200/50"
												style={`width: ${calculateWidth(
													domainTopCountries.map(([, value]) => value),
													value,
												)}%;`}
											></div>
											<div class="text-sm text-gray-500 truncate max-w-[300px] relative">{key}</div>
										</div>

										<div class="w-20 text-right">
											<div class="text-lg font-semibold text-gray-900 mr-2">{value.total}</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					<div class="w-full bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
						<div class="p-3 border-b border-gray-100">
							<h2 class="text-md text-gray-400">Referer</h2>
						</div>

						<div class="divide-y divide-gray-100">
							{domainTopReferers.map(([key, value]) => (
								<div class="p-1 hover:bg-gray-50 transition">
									<div class="flex items-center justify-between">
										<div class="flex flex-1 w-full h-full relative p-1">
											<div
												class="absolute top-0 left-0 h-full bg-amber-200/50"
												style={`width: ${calculateWidth(
													domainTopReferers.map(([, value]) => value),
													value,
												)}%;`}
											></div>
											<div class="text-sm text-gray-500 truncate max-w-[300px] relative">{key}</div>
										</div>

										<div class="w-20 text-right">
											<div class="text-lg font-semibold text-gray-900 mr-2">{value.total}</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				<div class="w-full flex flex-row gap-4">
					<div class="w-full bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
						<div class="p-3 border-b border-gray-100">
							<h2 class="text-md text-gray-400">Visits</h2>
						</div>

						<div class="divide-y divide-gray-100">
							{props.visitStatistics.map((item, i) => (
								<div class="p-1 hover:bg-gray-50 transition">
									<div class="flex items-center justify-between">
										<div class="flex flex-1 w-full h-full relative p-1">
											<div
												class="absolute top-0 left-0 h-full bg-amber-200/50"
												style={`width: ${calculatePageWidth(props.visitStatistics, item)}%;`}
											></div>
											<div class="text-sm text-gray-500 truncate max-w-[300px] relative">{item.actionValue}</div>
										</div>

										<div class="w-20 text-right">
											<div class="text-lg font-semibold text-gray-900 mr-2">{item.overallCounts.total}</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					<div class="w-full bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
						<div class="p-3 border-b border-gray-100">
							<h2 class="text-md text-gray-400">Events</h2>
						</div>

						<div class="divide-y divide-gray-100">
							{props.eventStatistics.map((item, i) => (
								<div class="p-1 hover:bg-gray-50 transition">
									<div class="flex items-center justify-between">
										<div class="flex flex-1 w-full h-full relative p-1">
											<div
												class="absolute top-0 left-0 h-full bg-amber-200/50"
												style={`width: ${calculatePageWidth(props.eventStatistics, item)}%;`}
											></div>
											<div class="text-sm text-gray-500 truncate max-w-[300px] relative">{item.actionValue}</div>
										</div>

										<div class="w-20 text-right">
											<div class="text-lg font-semibold text-gray-900 mr-2">{item.overallCounts.total}</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default Dashboard;
