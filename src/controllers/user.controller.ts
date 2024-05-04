import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import User, { UserDocument } from './../models/user.model';

import {
	ChangePasswordSchema,
	ChangeUserDetailSchema,
	GetChannelDetailSchema,
	UserLoginSchema,
	UserRegisterSchema,
} from '../schemas/user.schemas';
import ApiError from '../utils/APIError';
import ApiResponse from '../utils/APIResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary';
import UserType from '../types/user.type';
import mongoose from 'mongoose';

export const options = {
	httpOnly: true,
	secure: true,
};

export const generateAccessTokenAndRefreshToken = async (
	userId: mongoose.ObjectId
) => {
	if (!userId || !mongoose.isValidObjectId(userId)) {
		throw new ApiError(400, 'Invalid User ID');
	}
	try {
		const user = await User.findById(userId);
		if (!user) throw new ApiError(400, 'user not found');
		const accessToken = user?.generateAccessToken();
		const refreshToken = user?.generateRefreshToken();
		user.refreshToken = refreshToken;
		await user.save({ validateBeforeSave: false });

		return {
			accessToken,
			refreshToken,
		};
	} catch (error) {
		throw new ApiError(
			500,
			'Something went wrong while generating refresh and access token'
		);
	}
};

export const registerUser = asyncHandler(async (req, res) => {
	const { success } = UserRegisterSchema.safeParse(req.body);

	if (!success) {
		throw new ApiError(400, 'Wrong user Credentials');
	}
	const {
		username,
		fullName,
		password,
		email,
	}: Pick<UserType, 'username' | 'email' | 'fullName' | 'password'> = req.body;

	const existedUser = await User.findOne({
		$or: [{ username }, { email }],
	});

	if (existedUser) {
		throw new ApiError(409, 'User with email or username already exists');
	}

	const files = req.files as {
		[fieldname: string]: Express.Multer.File[];
	};
	const avatarLocalPath = files?.avatar?.[0]?.path;
	const coverImageLocalPath = files?.coverImage?.[0]?.path ?? '';
	console.log(files.coverImage);
	if (!avatarLocalPath) {
		throw new ApiError(400, 'Avatar file is required');
	}

	const avatar = await uploadOnCloudinary(avatarLocalPath);
	const coverImage = await uploadOnCloudinary(coverImageLocalPath);

	if (!avatar) {
		throw new ApiError(400, 'Avatar file is required');
	}

	const user: UserDocument = await User.create({
		fullName,
		avatar: avatar?.url,
		coverImage: '',
		email,
		password,
		username: username.toLowerCase(),
	});

	const createdUser = await User.findById(user._id).select(
		'-password -refreshToken'
	);
	console.log(createdUser);
	if (!createdUser) {
		throw new ApiError(500, 'Something went wrong while registering the user');
	}

	return res
		.status(201)
		.json(new ApiResponse(200, createdUser, 'User registered Successfully'));
});

export const LoginUser = asyncHandler(async (req, res) => {
	const { success } = UserLoginSchema.safeParse(req.body);

	if (!success) {
		throw new ApiError(400, 'Wrong User Credentials');
	}

	const {
		loginIdentity,
		password,
	}: Pick<
		UserType & { loginIdentity: UserType['email'] | UserType['username'] },
		'password' | 'loginIdentity'
	> = req.body;

	const user = await User.findOne({
		$or: [{ username: loginIdentity }, { email: loginIdentity }],
	});
	if (!user) {
		throw new ApiError(404, 'User does not exist');
	}
	const validatePassword = await user.comparePassword(password);
	if (!validatePassword) {
		throw new ApiError(400, 'Invalid user credentials');
	}
	const { accessToken, refreshToken } =
		await generateAccessTokenAndRefreshToken(user._id);
	const loggedInUser = await User.findById(user._id).select(
		'-password -refreshToken'
	);
	return res
		.status(200)
		.cookie('accessToken', accessToken, options)
		.cookie('refreshToken', 'accessToken', options)
		.json(
			new ApiResponse(
				200,
				{ user: loggedInUser, accessToken, refreshToken },
				'User logged In Successfully'
			)
		);
});
export const logOut = asyncHandler(async (req, res) => {
	await User.findByIdAndUpdate(
		req.user._id,
		{
			$unset: {
				refreshToken: 1,
			},
		},
		{ new: true }
	);

	return res
		.status(200)
		.clearCookie('accessToken', options)
		.clearCookie('refreshToken', options)
		.json(new ApiResponse(200, {}, 'User logged Out successfully'));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
	const incomingRefreshToken =
		req.cookies.refreshToken || req.body.refreshToken;
	if (!incomingRefreshToken) {
		throw new ApiError(401, 'Invalid Refresh Token');
	}
	try {
		const decodedToken = jwt.verify(
			incomingRefreshToken,
			process.env.REFRESH_TOKEN_SECRET as Secret
		) as JwtPayload;
		if (!decodedToken?._id || !mongoose.isValidObjectId(decodedToken?._id)) {
			throw new ApiError(401, 'Invalid access Token');
		}

		const user = await User.findById(decodedToken._id);
		if (!user) {
			throw new ApiError(401, 'Invalid access Token');
		}
		if (!(user.refreshToken === incomingRefreshToken)) {
			throw new ApiError(401, 'Refresh token is expired or used');
		}

		const { refreshToken, accessToken } =
			await generateAccessTokenAndRefreshToken(user._id);
		return res
			.status(200)
			.cookie('accessToken', accessToken, options)
			.cookie('refreshToken', 'accessToken', options)
			.json(
				new ApiResponse(
					200,
					{ accessToken, refreshToken },
					'Access Token refreshed'
				)
			);
	} catch (error) {
		throw new ApiError(
			401,
			(error as Error)?.message || 'Invalid Access Token'
		);
	}
});

export const changeCurrentPassword = asyncHandler(async (req, res) => {
	const { success } = ChangePasswordSchema.safeParse(req.body);
	if (!success) {
		throw new ApiError(401, 'Invalid Passwords');
	}
	const user = (await User.findById(req.user._id)) as UserDocument;

	const validatePassword = user?.comparePassword(req.body.oldPassword);
	if (!validatePassword) {
		throw new ApiError(401, 'Invalid old password');
	}
	user.password = req.body.newPassword;
	await user?.save();

	return res
		.status(200)
		.json(new ApiResponse(200, {}, 'Password changed successfully'));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
	return res
		.status(200)
		.json(new ApiResponse(200, req.user, 'User fetched Successfully'));
});

export const UpdateAccountDetails = asyncHandler(async (req, res) => {
	const { success } = ChangeUserDetailSchema.safeParse(req.body);

	if (!success) {
		throw new ApiError(400, 'Invalid Fields');
	}
	const { fullName, email }: Pick<UserType, 'email' | 'fullName'> = req.body;

	const updateFields = {
		...(fullName !== undefined && { fullName }),
		...(email !== undefined && { email }),
	};

	const user = await User.findByIdAndUpdate(
		req.user?._id,
		{
			$set: updateFields,
		},
		{ new: true }
	).select('-password -refreshToken');

	res
		.status(200)
		.json(new ApiResponse(200, user, 'Account details updated successfully'));
});

export const updateUserAvatar = asyncHandler(async (req, res) => {
	const avatarLocalPath = req.file?.path;

	if (!avatarLocalPath) {
		throw new ApiError(400, 'Avatar file is missing');
	}

	const deletedResource = await deleteFromCloudinary(req.user.avatar);
	const avatar = await uploadOnCloudinary(avatarLocalPath);
	if (!avatar?.url) {
		throw new ApiError(400, 'Error while uploading new avatar');
	}
	const user = await User.findByIdAndUpdate(
		req.user?._id,
		{
			$set: {
				avatar: avatar?.url,
			},
		},
		{ new: true }
	).select('-password -refreshToken');

	return res
		.status(200)
		.json(new ApiResponse(200, user, 'Avatar image updated successfully'));
});
export const updateCoverImage = asyncHandler(async (req, res) => {
	const coverImageLocalPath = req.file?.path;

	if (!coverImageLocalPath) {
		throw new ApiError(400, 'cover Image file is missing');
	}

	const deletedResource = await deleteFromCloudinary(req.user.coverImage);
	const coverImage = await uploadOnCloudinary(coverImageLocalPath);
	if (!coverImage?.url) {
		throw new ApiError(400, 'Error while uploading new coverImage');
	}
	const user = await User.findByIdAndUpdate(
		req.user?._id,
		{
			$set: {
				coverImage: coverImage?.url,
			},
		},
		{ new: true }
	).select('-password -refreshToken');

	return res
		.status(200)
		.json(new ApiResponse(200, user, 'cover Image updated successfully'));
});

export const getUserChannelProfile = asyncHandler(async (req, res) => {
	const { success } = GetChannelDetailSchema.safeParse(req.params);
	if (!success) {
		throw new ApiError(400, 'Username is missing');
	}
	const { username } = req.params;

	const channel = await User.aggregate([
		{
			$match: {
				username: username?.toLowerCase(),
			},
		},
		{
			$lookup: {
				from: 'subscriptions',
				localField: '_id',
				foreignField: 'channel',
				as: 'subscribers',
			},
		},
		{
			$lookup: {
				from: 'subscriptions',
				localField: '_id',
				foreignField: 'subscriber',
				as: 'subscribedTo',
			},
		},
		{
			$addFields: {
				subscribersCount: { $size: '$subscribers' },

				channelSubscribedToCount: { $size: '$subscribedTo' },
				isSubscribed: {
					$cond: {
						if: { $in: [req.user._id, '$subscribers.subscriber'] },
						then: true,
						else: false,
					},
				},
			},
		},
		{
			$project: {
				fullName: 1,
				username: 1,
				subscribersCount: 1,
				channelsSubscribedToCount: 1,
				isSubscribed: 1,
				avatar: 1,
				coverImage: 1,
				createdAt: 1,
			},
		},
	]);
	if (!channel.length) {
		throw new ApiError(404, 'Channel does not exist');
	}
	return res
		.status(200)
		.json(
			new ApiResponse(200, channel[0], 'User channel fetched successfully')
		);
});

export const getWatchHistory = asyncHandler(async (req, res) => {
	const user = await User.aggregate([
		{
			$match: {
				_id: req.user._id,
			},
		},
		{
			$lookup: {
				from: 'videos',
				foreignField: '_id',
				localField: 'watchHistory',
				as: 'watchHistory',
				pipeline: [
					{
						$lookup: {
							from: 'users',
							foreignField: '_id',
							localField: 'owner',
							as: 'owner',
							pipeline: [
								{
									$project: {
										fullName: 1,
										avatar: 1,
										username: 1,
									},
								},
							],
						},
					},
					{
						$addFields: {
							owner: {
								$first: '$owner',
							},
						},
					},
				],
			},
		},
	]);

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				user[0].watchHistory,
				'watch history fetched successfully'
			)
		);
});
