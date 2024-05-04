import  Router  from 'express';
import { authentication } from '../middlewares/auth.middleware';
import { getChannelStats, getChannelVideos } from '../controllers/dashboard.controller';

const router = Router();

router.use(authentication); 

router.route('/stats').get(getChannelStats);
router.route('/videos').get(getChannelVideos);

export default router;
