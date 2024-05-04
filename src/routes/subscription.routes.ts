import { Router } from 'express';
import { authentication } from '../middlewares/auth.middleware';
import {
	getSubscribedChannels,
	getUserChannelSubscribers,
	toggleSubscription,
} from '../controllers/subscription.controller';

const router = Router();
router.use(authentication);

router
	.route('/c/:channelId')
	.get(getUserChannelSubscribers)
	.post(toggleSubscription);

router.route('/u/:subscriberId').get(getSubscribedChannels);

export default router;
