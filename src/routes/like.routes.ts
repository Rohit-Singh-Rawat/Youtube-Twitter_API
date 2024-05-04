import { Router } from 'express';
import { authentication } from '../middlewares/auth.middleware';
import {
	getLikedVideos,
	toggleCommentLike,
	toggleTweetLike,
	toggleVideoLike,
} from '../controllers/like.controller';

const router = Router();
router.use(authentication);

router.route('/toggle/v/:videoId').post(toggleVideoLike);
router.route('/toggle/c/:commentId').post(toggleCommentLike);
router.route('/toggle/t/:tweetId').post(toggleTweetLike);
router.route('/videos').get(getLikedVideos);

export default router;
