import { Hono } from 'hono';

const app = new Hono<{ Bindings: Env }>();

const cloudStatsJS = `class CloudStats extends HTMLElement {
	constructor() {
		super();
	}

	getRefererDomain() {
		const referer = document.referrer;
		if (!referer) return null;
		try { return new URL(document.referrer).hostname; } 
		catch { return null; }
	}

	getCurrentUrlHash() {
		const url = window.location.origin + window.location.pathname;
		let hash = 0x811c9dc5;
		for (let i = 0; i < url.length; i++) {
			hash ^= url.charCodeAt(i);
			hash = Math.imul(hash, 0x01000193);
		}
		return (hash >>> 0).toString(16);
	}

	connectedCallback() {
		const action = this.getAttribute('action');
		const source = this.getRefererDomain();
		const hash = this.getCurrentUrlHash();
		const img = document.createElement('img');
		img.src = action
			? \`/assets/site/\${action}/image.png?h=\${hash}\${source ? \`&s=\${source}\` : ''}\`
			: \`/assets/site/image.png?h=\${hash}\${source ? \`&s=\${source}\` : ''}\`;
		img.width = 1;
		img.height = 1;
		this.appendChild(img);
	}
}
customElements.define('cloud-stats', CloudStats);`;

app.get('/cloudstats.webcomponent.js', (c) => {
	return c.text(cloudStatsJS, 200, {
		'Access-Control-Allow-Origin': '*',
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
