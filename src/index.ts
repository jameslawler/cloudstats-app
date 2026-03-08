import { Hono } from 'hono';
import assets from './api/assets';
import events from './api/events';
import js from './api/js';
import statistics from './api/statistics';

const app = new Hono();

app.route('/assets', assets);
app.route('/events', events);
app.route('/js', js);
app.route('/statistics', statistics);

export default app;
