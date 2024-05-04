import { Router } from 'express';
import userRouter from './user.routes';
import commentRouter from './comment.routes';
import likeRouter from './like.routes'; // Import likeRouter
import subscriptionRouter from './subscription.routes'; // Import subscriptionRouter
import tweetRouter from './tweet.routes'; // Import tweetRouter
import videoRouter from './video.routes'; // Import videoRouter
import healthCheckRouter from './healthCheck.routes'; // Import healthCheckRouter
import playlistRouter from './playlist.routes'; // Import playlistRouter
import dashboardRouter from './dashboard.routes'; // Import dashboardRouter

const router = Router();

// Routes declaration
router.use('/comment', commentRouter);
router.use('/likes', likeRouter);
router.use('/subscriptions', subscriptionRouter);
router.use('/tweet', tweetRouter);
router.use('/video', videoRouter);
router.use('/healthCheck', healthCheckRouter);
router.use('/playlist', playlistRouter);
router.use('/dashboard', dashboardRouter);

router.use('/users', userRouter);

export default router;
