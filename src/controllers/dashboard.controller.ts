import User from '../models/user.model';
import Video from '../models/video.model';
import ApiResponse from '../utils/APIResponse';
import { asyncHandler } from '../utils/asyncHandler';

const getChannelStats = asyncHandler(async (req, res) => {
	const channel = await User.aggregate([
		{
			$match: {
				_id: req.user._id,
			},
		},
		{
			$lookup: {
				from: 'videos',
				foreignField: 'owner',
				localField: '_id',
				as: 'videos',
				pipeline: [
					{
						$lookup: {
							from: 'likes',
							foreignField: 'video',
							localField: '_id',
							as: 'likes',
						},
					},
					{
						$addFields: {
							videoTotalLikes: {
								$size: '$likes',
							},
						},
					},
					{
						$project: {
							videoTotalLikes: 1,
						},
					},
				],
			},
		},
		{
			$lookup: {
				from: 'subscriptions',
				foreignField: 'channel',
				localField: '_id',
				as: 'subscribers',
			},
		},
		{
			$addFields: {
				totalSubscribers: {
					$size: '$subscribers',
				},
				totalVideos: {
					$size: '$videos',
				},
				totalLikes: {
					$reduce: {
						input: '$videos',
						initialValue: 0,
						in: { $add: ['$$value', '$this.videoTotalLikes'] },
					},
				},
				totalViews: {
					$reduce: {
						input: '$videos',
						initialValue: 0,
						in: { $add: ['$$value', '$this.views'] },
					},
				},
			},
		},
		{
			$project: {
				totalViews: 1,
				totalLikes: 1,
				totalVideos: 1,
				totalSubscribers: 1,
			},
		},
	]);
	return res
		.status(200)
		.json(
			new ApiResponse(200, channel[0], 'channel stats fetched successfully')
		);
});

const getChannelVideos = asyncHandler(async (req, res) => {
	const userID = req.user?._id;
	const Videos = await Video.aggregate([
		{
			$match: {
				owner: userID,
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
				from: 'comments',
				localField: '_id',
				foreignField: 'video',
				as: 'comments',
			},
		},
		{
			$addFields: {
				likes: {
					$size: '$likes',
				},
				comments: {
					$size: '$likes',
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
				videoFile: 1,
				thumbnail: 1,
				title: 1,
				description: 1,
				isPublished: 1,
				likes: 1,
				comments: 1,
			},
		},
	]);

    
    
	return res
		.status(200)
		.json(
			new ApiResponse(200, Videos, 'Channels videos fetched successfully')
		);
});

export { getChannelStats, getChannelVideos };
