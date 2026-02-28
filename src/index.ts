import { Hono } from 'hono';
import assets from './api/assets';
import statistics from './api/statistics';

const app = new Hono();

app.route('/assets', assets);
app.route('/statistics', statistics);

export default app;
