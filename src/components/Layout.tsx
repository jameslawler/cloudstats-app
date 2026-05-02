import type { FC } from 'hono/jsx';

const Layout: FC = (props) => {
	return (
		<html>
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<link href="/index.css" rel="stylesheet" />
			</head>
			<body>
				<div>{props.children}</div>
			</body>
		</html>
	);
};

export default Layout;
