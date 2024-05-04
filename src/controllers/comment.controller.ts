import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import mongoose, { AggregatePaginateResult } from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import Video from '../models/video.model.js';
import ApiError from '../utils/APIError.js';
import Comment from '../models/comment.model.js';
import ApiResponse from '../utils/APIResponse.js';
import { AddCommentSchema } from '../schemas/comment.schemas.js';
import Like from '../models/like.model.js';

const getVideoComments = asyncHandler(async (req, res) => {
	const { videoId } = req.params;
	const { page = 1, limit = 20 } = req.query;

	const video = await Video.findById(videoId);
	if (!video) {
		throw new ApiError(404, 'Video not found');
	}
	const commentsAggregate = Comment.aggregate([
		{
			$match: {
				video: video._id,
			},
		},
		{
			$lookup: {
				from: 'users',
				foreignField: '_id',
				localField: 'owner',
				as: 'owner',
			},
		},
		{
			$lookup: {
				from: 'likes',
				foreignField: 'comment',
				localField: '_id',
				as: 'likes',
			},
		},
		{
			$addFields: {
				owner: {
					$first: '$owner',
				},
				likeCount: {
					$size: '$likes',
				},
				isLiked: {
					$cond: {
						if: { $in: [req.user?._id, '$likes.likedBy'] },
						then: true,
						else: false,
					},
				},
				isEdited: {
					$cond: {
						if: { $eq: ['$createdAt', '$updatedAt'] },
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
				_id: 1,
				content: 1,
				createdAt: 2,
				isEdited: 1,
				owner: {
					username: 1,
					fullName: 1,
					avatar: 1,
				},
				likeCount: 1,
				isLiked: 1,
			},
		},
	]);

	const options = {
		page: parseInt(page as string, 10),
		limit: parseInt(limit as string, 10),
	};

	const comments: AggregatePaginateResult<any[]> =
		await Comment.aggregatePaginate(commentsAggregate, options);

	return res
		.status(200)
		.json(new ApiResponse(200, comments, 'Comments fetched successfully'));
});
const addComment = asyncHandler(async (req, res) => {
	const { videoId } = req.params;
	const { success } = AddCommentSchema.safeParse(req.body);

	if (!success) {
		throw new ApiError(400, 'Content is required');
	}
	const video = await Video.findById(videoId);

	if (!video) {
		throw new ApiError(404, 'video not found');
	}
	const comment = await Comment.create({
		content: req.body?.content,
		video: videoId,
		owner: req.user?._id,
	});

	if (!comment) {
		throw new ApiError(500, 'Error while adding Comment!!! pls try again');
	}

	return res
		.status(201)
		.json(new ApiResponse(201, comment, 'Comment added successfully'));
});

const updateComment = asyncHandler(async (req, res) => {
	const { commentId } = req.params;
	const { success } = AddCommentSchema.safeParse(req.body);

	if (!success) {
		throw new ApiError(400, 'Content is required');
	}
	const comment = await Comment.findById(commentId);

	if (!comment) {
		throw new ApiError(404, 'comment not found');
	}
	if (comment?.owner?.toString() !== req.user?._id?.toString()) {
		throw new ApiError(
			400,
			'Unauthorized Owner: only comment owner can Edit the comment'
		);
	}

	const updatedComment = await Comment.findByIdAndUpdate(
		comment?._id,
		{
			$set: { content: req.body?.content },
		},
		{
			new: true,
		}
	);

	if (!updatedComment) {
		throw new ApiError(500, 'Error while Editing Comment!!! pls try again');
	}

	return res
		.status(201)
		.json(new ApiResponse(201, comment, 'Comment edited successfully'));
});

const deleteComment = asyncHandler(async (req, res) => {
	const { commentId } = req.params;
	const { success } = AddCommentSchema.safeParse(req.body);

	if (!success) {
		throw new ApiError(400, 'Content is required');
	}
	const comment = await Comment.findById(commentId);

	if (!comment) {
		throw new ApiError(404, 'comment not found');
	}
	if (comment?.owner?.toString() !== req.user?._id?.toString()) {
		throw new ApiError(
			400,
			'Unauthorized Owner: only comment owner can delete the comment'
		);
	}

	const deletedComment = await Comment.findOneAndDelete({ _id: comment._id });

	if (!deleteComment) {
		throw new ApiError(500, 'Error while deleting Comment!!! pls try again');
	}

	await Like.deleteMany({
		comment: commentId,
	});

	return res
		.status(201)
		.json(new ApiResponse(201, comment, 'Comment deleted successfully'));
});

export { getVideoComments, addComment, updateComment, deleteComment };
