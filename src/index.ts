import 'dotenv/config';
import connectDB from './db/index';
import app from './app';
import { Application } from 'express';

connectDB()
	.then(() => {
		const PORT = process.env.PORT ?? 8000;
        app.on('error', (error) => {
					console.log('ERRR: ', error);
				});
		app.listen(PORT, () => {
			console.log(`Server is running at PORT : ${PORT}`);
		});
	})
	.catch((err: Error) => {
		console.log('MONGO DB connection failed !!!', err);
	});
