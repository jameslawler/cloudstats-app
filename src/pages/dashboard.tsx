import type { FC } from 'hono/jsx';
import { Statistic } from '../types/statistic';

const Dashboard: FC<{ domainTotalVisits: number; topTen: Statistic[] }> = (props: { domainTotalVisits: number; topTen: Statistic[] }) => {
	return (
		<div>
			<div>Hello Dashboard</div>
			<div>Total: {props.domainTotalVisits}</div>
			<div>Top Ten: {props.topTen.length}</div>
		</div>
	);
};

export default Dashboard;
