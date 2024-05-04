import { Router } from 'express';
import { authentication } from '../middlewares/auth.middleware';
import upload from '../middlewares/multer.middleware';
import {
	createTweet,
	deleteTweet,
	getUserTweets,
	updateTweet,
} from '../controllers/tweet.controller';

const router = Router();

router.use(authentication, upload.none()); 

router.route('/').post(createTweet);
router.route('/user/:userId').get(getUserTweets);
router.route('/:tweetId').patch(updateTweet).delete(deleteTweet);

export default router;
