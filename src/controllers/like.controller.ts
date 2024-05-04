import mongoose, { isValidObjectId } from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler';
import Video, { VideoDocument } from '../models/video.model';
import ApiError from '../utils/APIError';
import Like, { LikeDocument } from '../models/like.model';
import ApiResponse from '../utils/APIResponse';
import Comment, { CommentDocument } from '../models/comment.model';
import Tweet, { TweetDocument } from '../models/tweet.model';

const toggleVideoLike = asyncHandler(async (req, res) => {
	const { videoId } = req.params;
	if (!mongoose.isValidObjectId(videoId)) {
		throw new ApiError(400, 'Invalid videoId');
	}
	const video: VideoDocument | null = await Video.findById(videoId);

	if (!video) {
		throw new ApiError(404, 'Video not found');
	}
	const likedAlready = await Like.findOne({
		likedBy: req.user._id,
		video: videoId,
	});
	if (likedAlready) {
		await Like.deleteOne({ likedBy: req.user._id, video: videoId });

		return res
			.status(200)
			.json(new ApiResponse(200, { LikedState: false }, 'unlike video'));
	}
	const like: LikeDocument = await Like.create({
		likedBy: req.user._id,
		video: videoId,
	});

	if (!like) {
		throw new ApiError(500, 'Error while liking the video!!! Pls try again');
	}

	return res
		.status(200)
		.json(
			new ApiResponse(200, { LikedState: true }, 'Video Liked successfully')
		);
});

const toggleCommentLike = asyncHandler(async (req, res) => {
	const { commentId } = req.params;
	if (!mongoose.isValidObjectId(commentId)) {
		throw new ApiError(400, 'Invalid commentId');
	}
	const comment: CommentDocument | null = await Comment.findById(commentId);

	if (!comment) {
		throw new ApiError(404, 'Comment not found');
	}
	const likedAlready = await Like.findOne({
		likedBy: req.user._id,
		comment: commentId,
	});
	if (likedAlready) {
		await Like.deleteOne({ likedBy: req.user._id, comment: commentId });

		return res
			.status(200)
			.json(new ApiResponse(200, { LikedState: false }, 'unlike comment'));
	}
	const like: LikeDocument = await Like.create({
		likedBy: req.user._id,
		comment: commentId,
	});

	if (!like) {
		throw new ApiError(500, 'Error while liking the comment!!! Pls try again');
	}

	return res
		.status(200)
		.json(
			new ApiResponse(200, { LikedState: true }, 'comment Liked successfully')
		);
});

const toggleTweetLike = asyncHandler(async (req, res) => {
	const { tweetId } = req.params;
	if (!mongoose.isValidObjectId(tweetId)) {
		throw new ApiError(400, 'Invalid tweetId');
	}
	const tweet: TweetDocument | null = await Tweet.findById(tweetId);

	if (!tweet) {
		throw new ApiError(404, 'tweet not found');
	}
	const likedAlready = await Like.findOne({
		likedBy: req.user._id,
		tweet: tweetId,
	});
	if (likedAlready) {
		await Like.deleteOne({ likedBy: req.user._id, tweet: tweetId });

		return res
			.status(200)
			.json(new ApiResponse(200, { LikedState: false }, 'unlike tweet'));
	}
	const like: LikeDocument = await Like.create({
		likedBy: req.user._id,
		tweet: tweetId,
	});

	if (!like) {
		throw new ApiError(500, 'Error while liking the tweet!!! Pls try again');
	}

	return res
		.status(200)
		.json(
			new ApiResponse(200, { LikedState: true }, 'tweet Liked successfully')
		);
});

const getLikedVideos = asyncHandler(async (req, res) => {
	//TODO: get all liked videos
	const likedVideos = await Like.aggregate([
		{
			$match: {
				likedBy: req.user._id,
				video: { $exists: true },
				$and: [
					{
						$or: [{ comment: { $exists: false } }, { comment: null }],
					},
					{
						$or: [{ tweet: { $exists: false } }, { tweet: null }],
					},
				],
			},
		},
		{
			$lookup: {
				from: 'videos',
				foreignField: '_id',
				localField: 'video',
				as: 'video',
				pipeline: [
					{
						$lookup: {
							from: 'users',
							localField: 'owner',
							foreignField: '_id',
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
				],
			},
		},
		{
			$addFields: {
				video: {
					$first: '$video',
				},
			},
		},
		{
			$replaceRoot: { newRoot: '$video' },
		},
	]);

	return res
		.status(200)
		.json(
			new ApiResponse(200, likedVideos, 'Liked videos fetched successfully')
		);
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
