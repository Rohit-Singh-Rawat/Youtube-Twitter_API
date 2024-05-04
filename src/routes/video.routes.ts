import { Router } from 'express';
import {
	deleteVideo,
	getAllVideos,
	getVideoById,
	updateVideo,
	publishAVideo,
	togglePublishStatus,
} from '../controllers/video.controller';
import { authentication } from '../middlewares/auth.middleware';
import upload from '../middlewares/multer.middleware';

const router = Router();


router
	.route('/')
	.get(getAllVideos)
	.post(
		authentication,
		upload.fields([
			{
				name: 'videoFile',
				maxCount: 1,
			},
			{
				name: 'thumbnail',
				maxCount: 1,
			},
		]),
		publishAVideo
	);

router
	.route('/v/:videoId')
	.get(authentication, getVideoById)
	.delete(authentication, deleteVideo)
	.patch(authentication, upload.single('thumbnail'), updateVideo);

router
	.route('/toggle/publish/:videoId')
	.patch(authentication, togglePublishStatus);

export default router;
