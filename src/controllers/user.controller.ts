import User, { UserDocument } from './../models/user.model';

import { UserLoginSchema, UserRegisterSchema } from '../schemas/user.schemas';
import ApiError from '../utils/APIError';
import ApiResponse from '../utils/APIResponse';
import { asyncHandler } from '../utils/asyncHandler';
import uploadOnCloudinary from '../utils/cloudinary';
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
	res
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
