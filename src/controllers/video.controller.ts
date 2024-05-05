import mongoose, { Aggregate, PipelineStage, isValidObjectId } from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler';
import ApiError from '../utils/APIError';
import Video, { VideoDocument } from '../models/video.model';
import Like from '../models/like.model';
import Comment from '../models/comment.model';
import ApiResponse from '../utils/APIResponse';
import User from '../models/user.model';
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary';
import { UpdateVideoSchema } from '../schemas/video.schemas';

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

	if (sortBy && sortType) {
		pipeline.push({
			$sort: {
				[sortBy]: sortType === SortType.ASC ? 1 : -1,
			},
		});
	} else if (sortBy && !sortType) {
		pipeline.push({
			$sort: {
				[sortBy]: 1,
			},
		});
	} else {
		pipeline.push({ $sort: { createdAt: -1 } });
	}
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



const updateVideo = asyncHandler(async (req, res) => {
	const { videoId } = req.params;
	const { success } = UpdateVideoSchema.safeParse(req.body);
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
		.json(new ApiResponse(200, updateVideo, 'video updated successful ly'));
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

	await deleteFromCloudinary(deletedVideo?.videoFile);
	await deleteFromCloudinary(deletedVideo.thumbnail);

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
