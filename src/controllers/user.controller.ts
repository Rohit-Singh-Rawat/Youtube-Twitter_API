import User from '../models/user.model';
import { UserRegisterSchema } from '../schemas/user.schemas';
import ApiError from '../utils/APIError';
import ApiResponse from '../utils/APIResponse';
import { asyncHandler } from '../utils/asyncHandler';
import uploadOnCloudinary from '../utils/cloudinary';


export const registerUser = asyncHandler(async (req, res) => {
	const { success } = UserRegisterSchema.safeParse(req.body);
	
	if (!success) {
		throw new ApiError(400, 'All fields are required');
	}
	const {
		username,
		fullName,
		password,
		email,
	}: { username: string; fullName: string; password: string; email: string } =
		req.body;

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
	console.log(files.coverImage)
	if (!avatarLocalPath) {
		throw new ApiError(400, 'Avatar file is required');
	}

	const avatar = await uploadOnCloudinary(avatarLocalPath);
	const coverImage = await uploadOnCloudinary(coverImageLocalPath);

	if (!avatar) {
		throw new ApiError(400, 'Avatar file is required');
	}

	const user = await User.create({
		fullName,
		avatar: avatar?.url,
		coverImage:  '',
		email,
		password,
		username: username.toLowerCase(),
	});

	const createdUser = await User.findById(user._id).select(
		'-password -refreshToken'
	);
	console.log(createdUser)
	if (!createdUser) {
		throw new ApiError(500, 'Something went wrong while registering the user');
	}

	return res
		.status(201)
		.json(new ApiResponse(200, createdUser, 'User registered Successfully'));
});
