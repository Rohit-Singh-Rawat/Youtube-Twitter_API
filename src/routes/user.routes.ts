import {
	getUserChannelProfile,
	getWatchHistory,
	updateCoverImage,
} from './../controllers/user.controller';
import { Router } from 'express';
import {
	LoginUser,
	UpdateAccountDetails,
	changeCurrentPassword,
	getCurrentUser,
	logOut,
	refreshAccessToken,
	registerUser,
	updateUserAvatar,
} from '../controllers/user.controller';
import upload from '../middlewares/multer.middleware';
import { authentication } from '../middlewares/auth.middleware';

const router = Router();

router.route('/register').post(
	upload.fields([
		{ name: 'avatar', maxCount: 1 },
		{ name: 'coverImage', maxCount: 1 },
	]),
	registerUser
);
router.route('/login').post(upload.none(), LoginUser);

router.route('/logout').post(authentication, logOut);
router.route('/refresh-token').post(refreshAccessToken);
router
	.route('/change-password')
	.post(upload.none(), authentication, changeCurrentPassword);
router.route('/current-user').get(authentication, getCurrentUser);

router
	.route('/update-user')
	.patch(upload.none(), authentication, UpdateAccountDetails);
router
	.route('/update-avatar')
	.patch(authentication, upload.single('avatar'), updateUserAvatar);
router
	.route('/update-coverImg')
	.patch(authentication, upload.single('coverImage'), updateCoverImage);

router.route('/c/:username').get(authentication, getUserChannelProfile);
router.route('/watch-history').get(authentication, getWatchHistory);

export default router;
