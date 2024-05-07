import mongoose, { Aggregate, PipelineStage, isValidObjectId } from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler';
import ApiError from '../utils/APIError';
import Video, { VideoDocument } from '../models/video.model';
import Like from '../models/like.model';
import Comment from '../models/comment.model';
import ApiResponse from '../utils/APIResponse';
import User from '../models/user.model';
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary';
import {
	PublishVideoSchema,
	UpdateVideoSchema,
} from '../schemas/video.schemas';
import { v2 as cloudinary } from 'cloudinary';
import zod from 'zod';

enum SortBy {
	VIEWS = 'views',
	CREATED_AT = 'createdAt',
	DURATION = 'duration',
}

enum SortType {
	ASC = 'asc',
	DESC = 'desc',
}
interface QueryParams {
	page?: string;
	limit?: string;
	query?: string;
	sortBy?: SortBy;
	sortType?: SortType;
	userId?: string;
}

const getAllVideos = asyncHandler(async (req, res) => {
	const {
		page = 1,
		limit = 10,
		query,
		sortBy,
		sortType,
		userId,
	} = req.query as QueryParams;

	const pipeline: PipelineStage[] = [];

	if (query) {
		
		pipeline.push({
			$match: {
				$text: {
					$search: query,
					$caseSensitive: false,
				},
			},
		});
	}

	if (userId) {
		if (!isValidObjectId(userId)) {
			throw new ApiError(400, 'Invalid userId');
		}
		const user = await User.findById(userId);
		if (!user) {
			throw new ApiError(404, 'channel not found');
		}
		pipeline.push({
			$match: {
				owner: new mongoose.Types.ObjectId(userId),
			},
		});
	}

	pipeline.push({ $match: { isPublished: true } });

	pipeline.push({
		$sort: {
			[sortBy || SortBy.CREATED_AT]:
				(sortType || SortType.ASC) === SortType.ASC ? 1 : -1,
		},
	});
	pipeline.push(
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
							'avatar.url': 1,
						},
					},
				],
			},
		},
		{
			$unwind: '$owner',
		}
	);
	const videoAggregate = Video.aggregate(pipeline);

	const options = {
		page: parseInt(page as string, 10),
		limit: parseInt(limit as string, 10),
	};

	const videos = await Video.aggregatePaginate(videoAggregate, options);

	return res
		.status(200)
		.json(new ApiResponse(200, videos, 'videos fetched successfully'));
});

const publishAVideo = asyncHandler(async (req, res) => {
	const { videoId } = req.params;
	const { success } = PublishVideoSchema.safeParse(req.body);
	if (!success) {
		throw new ApiError(400, 'Valid content is required');
	}
	const { description, title }: zod.infer<typeof PublishVideoSchema> = req.body;

	const files = req.files as {
		[fieldname: string]: Express.Multer.File[];
	};
	const videoFileLocalPath = files?.videoFile?.[0].path;
	const thumbnailLocalPath = files?.thumbnail?.[0].path;

	if (!videoFileLocalPath) {
		throw new ApiError(400, 'videoFileLocalPath is required');
	}

	if (!thumbnailLocalPath) {
		throw new ApiError(400, 'thumbnailLocalPath is required');
	}

	const videoFile = await uploadOnCloudinary(videoFileLocalPath);
	const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

	if (!videoFile) {
		throw new ApiError(400, 'Video file not found');
	}

	if (!thumbnail) {
		throw new ApiError(400, 'Thumbnail not found');
	}

	const video = await Video.create({
		title,
		description,
		duration: videoFile.duration,
		videoFile: videoFile.url,
		thumbnail: thumbnail.url,
		owner: req.user?._id,
		isPublished: false,
	});

	const videoUploaded = await Video.findById(video._id);

	if (!videoUploaded) {
		throw new ApiError(500, 'videoUpload failed please try again !!!');
	}

	return res
		.status(200)
		.json(new ApiResponse(200, video, 'Video uploaded successfully'));
});

const getVideoById = asyncHandler(async (req, res) => {
	const { videoId } = req.params;

	if (!isValidObjectId(videoId)) {
		throw new ApiError(400, 'Invalid videoId');
	}

	if (!isValidObjectId(req.user?._id)) {
		throw new ApiError(400, 'Invalid userId');
	}

	const video = await Video.aggregate([
		{
			$match: {
				_id: new mongoose.Types.ObjectId(videoId),
			},
		},
		{
			$lookup: {
				from: 'likes',
				localField: '_id',
				foreignField: 'video',
				as: 'likes',
			},
		},
		{
			$lookup: {
				from: 'users',
				localField: 'owner',
				foreignField: '_id',
				as: 'owner',
				pipeline: [
					{
						$lookup: {
							from: 'subscriptions',
							localField: '_id',
							foreignField: 'channel',
							as: 'subscribers',
						},
					},
					{
						$addFields: {
							subscribersCount: {
								$size: '$subscribers',
							},
							isSubscribed: {
								$cond: {
									if: {
										$in: [req.user?._id, '$subscribers.subscriber'],
									},
									then: true,
									else: false,
								},
							},
						},
					},
					{
						$project: {
							username: 1,
							avatar: 1,
							subscribersCount: 1,
							isSubscribed: 1,
						},
					},
				],
			},
		},
		{
			$addFields: {
				likesCount: {
					$size: '$likes',
				},
				owner: {
					$first: '$owner',
				},
				isLiked: {
					$cond: {
						if: { $in: [req.user?._id, '$likes.likedBy'] },
						then: true,
						else: false,
					},
				},
			},
		},
		{
			$project: {
				videoFile: 1,
				thumbnail: 1,
				title: 1,
				description: 1,
				views: 1,
				createdAt: 1,
				duration: 1,
				owner: 1,
				likesCount: 1,
				isLiked: 1,
			},
		},
	]);

	if (!video) {
		throw new ApiError(500, 'failed to fetch video');
	}

	const UpdatedVideo = await Video.findByIdAndUpdate(
		videoId,
		{
			$inc: {
				views: 1,
			},
		},
		{ new: true }
	);

	await User.findByIdAndUpdate(req.user?._id, {
		$addToSet: {
			watchHistory: videoId,
		},
	});

	return res
		.status(200)
		.json(new ApiResponse(200, video[0], 'video details fetched successfully'));
});

const updateVideo = asyncHandler(async (req, res) => {
	const { videoId } = req.params;
	const { success } = UpdateVideoSchema.safeParse(req.body);
	if (!success) {
		throw new ApiError(400, 'Valid content is required');
	}
	const { description, title }: Pick<VideoDocument, 'description' | 'title'> =
		req.body;

	if (!mongoose.isValidObjectId(videoId)) {
		throw new ApiError(400, 'Invalid videoId');
	}

	const video = await Video.findById(videoId);

	if (!video) {
		throw new ApiError(404, 'video not found');
	}
	if (video?.owner?.toString() !== req.user?._id?.toString()) {
		throw new ApiError(
			400,
			'Unauthorized Owner: only video owner can update the video'
		);
	}
	const oldThumbnail: string = video.thumbnail;
	const localThumbnailPath = req.file?.path;
	if (!localThumbnailPath) {
		throw new ApiError(400, 'thumbnail file is missing');
	}

	const thumbnail = await uploadOnCloudinary(localThumbnailPath);
	if (!thumbnail?.url) {
		throw new ApiError(400, 'Error while uploading new thumbnail');
	}
	const updatedVideo = await Video.findByIdAndUpdate(
		videoId,
		{
			$set: {
				title: title,
				description: description,
				thumbnail: thumbnail?.url,
			},
		},
		{ new: true }
	);

	if (!updateVideo) {
		throw new ApiError(400, 'failed to update video!!! pls try again');
	}

	const deletedResource = await deleteFromCloudinary(oldThumbnail);

	return res
		.status(200)
		.json(new ApiResponse(200, updateVideo, 'video updated successfully'));
});

const deleteVideo = asyncHandler(async (req, res) => {
	const { videoId } = req.params;
	if (!mongoose.isValidObjectId(videoId)) {
		throw new ApiError(400, 'Invalid videoId');
	}

	const video = await Video.findById(videoId);

	if (!video) {
		throw new ApiError(404, 'video not found');
	}
	if (video?.owner?.toString() !== req.user?._id?.toString()) {
		throw new ApiError(
			400,
			'Unauthorized Owner: only video owner can delete the video'
		);
	}

	const deletedVideo = await Video.findOneAndDelete({ _id: video._id });

	if (!deletedVideo) {
		throw new ApiError(500, 'Error while deleting video!!! pls try again');
	}

	const r = await deleteFromCloudinary(deletedVideo?.videoFile);
	const s = await deleteFromCloudinary(deletedVideo.thumbnail);
	
	await Like.deleteMany({
		video: videoId,
	});
	await Comment.deleteMany({
		video: videoId,
	});

	return res
		.status(201)
		.json(new ApiResponse(201, video, 'video deleted successfully'));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
	const { videoId } = req.params;
	if (!mongoose.isValidObjectId(videoId)) {
		throw new ApiError(400, 'Invalid videoId');
	}

	const video = await Video.findById(videoId);

	if (!video) {
		throw new ApiError(404, 'video not found');
	}
	if (video?.owner?.toString() !== req.user?._id?.toString()) {
		throw new ApiError(
			400,
			'Unauthorized Owner: only video owner can delete the video'
		);
	}

	const updateVideo = await Video.findByIdAndUpdate(
		video?._id,
		{
			$set: {
				isPublished: !video.isPublished,
			},
		},
		{
			new: true,
		}
	);
	if (!updateVideo) {
		throw new ApiError(500, 'Error while toggling publish');
	}

	return res
		.status(200)
		.json(new ApiResponse(200, updateVideo, 'publish toggled  successfully'));
});

export {
	getAllVideos,
	publishAVideo,
	getVideoById,
	updateVideo,
	deleteVideo,
	togglePublishStatus,
};
