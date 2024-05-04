import { Router } from 'express';
import { authentication } from '../middlewares/auth.middleware';
import { healthCheck } from '../controllers/healthCheck.controller';

const router = Router();

router.use(authentication);
router.route('/').get(healthCheck);

export default router;
