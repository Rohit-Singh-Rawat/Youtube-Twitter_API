import Router from 'express';
import upload from '../middlewares/multer.middleware';
import { authentication } from '../middlewares/auth.middleware';
import {
	addComment,
	deleteComment,
	getVideoComments,
	updateComment,
} from '../controllers/comment.controller';

const router = Router();

router.use(authentication, upload.none());
router.route('/:videoId').get(getVideoComments).post(addComment);
router.route('/c/:commentId').delete(deleteComment).patch(updateComment);

export default router;
