import { Hono } from 'hono';

const app = new Hono<{ Bindings: Env }>();

const cloudStatsJS = (domain: string) => `class CloudStats extends HTMLElement {
	constructor() {
		super();
	}

	getRefererDomain() {
		const referer = document.referrer;
		if (!referer) return null;
		try { return new URL(document.referrer).hostname; } 
		catch { return null; }
	}

	connectedCallback() {
		const action = this.getAttribute('action');
		const source = this.getRefererDomain();
		const img = document.createElement('img');
    const pageUrl = encodeURIComponent(window.location.origin + window.location.pathname);

    img.src = action
			? \`${domain}/assets/site/\${action}/image.png?u=\${pageUrl}\${source ? \`&s=\${source}\` : ''}\`
			: \`${domain}/assets/site/image.png\${source ? \`?s=\${source}\` : ''}\`;
		img.width = 1;
		img.height = 1;
		this.appendChild(img);
	}
}
customElements.define('cloud-stats', CloudStats);`;

app.get('/cloudstats.webcomponent.js', (c) => {
	const url = new URL(c.req.url);
	const domain = url.origin;

	return c.text(cloudStatsJS(domain), 200, {
		'Access-Control-Allow-Origin': '*',
		'Content-Type': 'application/javascript',
	});
});

app.options('/cloudstats.webcomponent.js', (c) => {
	return c.text('', 200, {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET,OPTIONS',
		'Access-Control-Allow-Headers': '*',
	});
});

export default app;
