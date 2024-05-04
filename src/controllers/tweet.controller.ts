import Tweet, { TweetDocument } from './../models/tweet.model';
import mongoose, { isValidObjectId } from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler';
import { CreateTweetSchema, UpdateTweetSchema } from '../schemas/tweet.schemas';
import TweetType from '../types/tweet.type';
import ApiError from '../utils/APIError';
import ApiResponse from '../utils/APIResponse';
import User, { UserDocument } from '../models/user.model';

const createTweet = asyncHandler(async (req, res) => {
	const { success } = CreateTweetSchema.safeParse(req.body);

	if (!success) {
		throw new ApiError(400, 'Valid content is required');
	}
	const { content }: Pick<TweetType, 'content'> = req.body;

	const tweet: TweetDocument = await Tweet.create({
		owner: req.user?._id,
		content: content,
	});

	if (!tweet) {
		throw new ApiError(400, 'error while creating tweet!!! please try again');
	}

	return res
		.status(200)
		.json(new ApiResponse(200, tweet, 'tweet created successfully'));
});

const getUserTweets = asyncHandler(async (req, res) => {
	const { userId } = req.params;

	if (!mongoose.isValidObjectId(userId)) {
		throw new ApiError(400, 'Invalid userId');
	}
	const user: UserDocument | null = await User.findById(userId);

	if (!user) {
		throw new ApiError(404, 'user not found');
	}
	const tweets = await Tweet.aggregate([
		{
			$match: {
				owner: new mongoose.Types.ObjectId(userId),
			},
		},
		{
			$lookup: {
				from: 'users',
				foreignField: '_id',
				localField: 'owner',
				as: 'owner',
				pipeline: [
					{
						$project: {
							username: 1,
							fullName: 1,
							avatar: 1,
						},
					},
				],
			},
		},
		{ $unwind: '$owner' },
		{
			$lookup: {
				from: 'likes',
				foreignField: 'tweet',
				localField: '_id',
				as: 'likes',
			},
		},
		{
			$addFields: {
				totalLikes: {
					$size: '$likes',
				},
				isLiked: {
					$cond: {
						if: {
							$in: [req.user?._id, '$likes.likedBy'],
						},
						then: true,
						else: false,
					},
				},
			},
		},
		{
			$sort: {
				createdAt: -1,
			},
		},
		{
			$project: {
				content: 1,
				owner: 1,
				totalLikes: 1,
				createdAt: 1,
				isLiked: 1,
			},
		},
	]);
	return res.status(200).json(new ApiResponse(200, tweets, 'tweets fetched'));
});

const updateTweet = asyncHandler(async (req, res) => {
	const { tweetId } = req.params;

	const { success } = UpdateTweetSchema.safeParse(req.body);

	if (!success) {
		throw new ApiError(400, 'Valid content is required');
	}

	const { content }: Pick<TweetType, 'content'> = req.body;

	if (!isValidObjectId(tweetId)) {
		throw new ApiError(400, 'Invalid tweetId');
	}

	const tweet = await Tweet.findById(tweetId);

	if (!tweet) {
		throw new ApiError(404, 'Tweet not found');
	}

	if (tweet?.owner.toString() !== req.user?._id.toString()) {
		throw new ApiError(400, 'Unauthorized: only owner can edit their tweet');
	}

	const updatedTweet = await Tweet.findByIdAndUpdate(
		tweetId,
		{
			$set: {
				content: content,
			},
		},
		{
			new: true,
		}
	);

	if (!updateTweet) {
		throw new ApiError(400, 'Failed to update tweet!!! please try again');
	}
	return res
		.status(200)
		.json(new ApiResponse(200, updateTweet, 'tweet updated successfully'));
});

const deleteTweet = asyncHandler(async (req, res) => {
	const { tweetId } = req.params;

	if (!isValidObjectId(tweetId)) {
		throw new ApiError(400, 'Invalid tweetId');
	}

	const tweet = await Tweet.findById(tweetId);

	if (!tweet) {
		throw new ApiError(404, 'Tweet not found');
	}

	if (tweet?.owner.toString() !== req.user?._id.toString()) {
		throw new ApiError(400, 'Unauthorized: only owner can edit their tweet');
	}

	const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

	if (!deletedTweet) {
		throw new ApiError(400, 'Failed to update tweet!!! please try again');
	}
	return res
		.status(200)
		.json(new ApiResponse(200, {}, 'tweet deleted successfully'));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
