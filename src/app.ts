import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import status from 'express-status-monitor'
const app: express.Application = express();

app.use(
	cors({
		origin: process.env.CORS_ORIGIN,
		credentials: true,
	})
);
app.use(status())
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

import router from './routes/common.routes';
app.use('/api/v1', router);

export default app;
