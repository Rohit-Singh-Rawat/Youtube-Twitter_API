import mongoose, { isValidObjectId } from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler';
import {
	CreatePlaylistSchema,
	UpdatePlaylistSchema,
} from '../schemas/playlist.schema';
import ApiError from '../utils/APIError';
import Playlist, { PlaylistDocument } from '../models/playlist.model';
import ApiResponse from '../utils/APIResponse';
import User, { UserDocument } from '../models/user.model';
import Video, { VideoDocument } from '../models/video.model';

const createPlaylist = asyncHandler(async (req, res) => {
	const { success } = CreatePlaylistSchema.safeParse(req.body);

	if (!success) {
		throw new ApiError(400, 'give Valid name and description');
	}
	const {
		name,
		description = 'No description',
	}: Pick<PlaylistDocument, 'name' | 'description'> = req.body;
	const playlist = await Playlist.create({
		name,
		description,
		videos: [],
		owner: req.user._id,
	});

	if (!playlist) {
		throw new ApiError(500, 'Error while Creating playlist');
	}

	return res
		.status(200)
		.json(new ApiResponse(200, playlist, 'Playlist created successfully'));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
	const { userId } = req.params;

	if (!mongoose.isValidObjectId(userId)) {
		throw new ApiError(400, 'Invalid userId');
	}
	const user: UserDocument | null = await User.findById(userId);

	if (!user) {
		throw new ApiError(404, 'user not found');
	}
	const playlists = await Playlist.aggregate([
		{
			$match: {
				owner: new mongoose.Types.ObjectId(userId),
			},
		},
		{
			$lookup: {
				from: 'videos',
				localField: 'videos',
				foreignField: '_id',
				as: 'videos',
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
					{
						$unwind: '$owner',
					},
				],
			},
		},
		{
			$match: {
				'videos.isPublished': true,
			},
		},
		{
			$addFields: {
				totalVideos: {
					$size: '$videos',
				},
				totalViews: {
					$sum: '$videos.views',
				},
			},
		},
		{
			$project: {
				_id: 1,
				name: 1,
				description: 1,
				totalVideos: 1,
				totalViews: 1,
				updatedAt: 1,
				videos: 1,
			},
		},
	]);

	return res
		.status(200)
		.json(
			new ApiResponse(200, playlists, 'user playlists fetched successfully')
		);
});

const getPlaylistById = asyncHandler(async (req, res) => {
	const { playlistId } = req.params;

	if (!mongoose.isValidObjectId(playlistId)) {
		throw new ApiError(400, 'Invalid playlistId');
	}

	const playlist: PlaylistDocument | null = await Playlist.findById(playlistId);

	if (!playlist) {
		throw new ApiError(404, 'playlist not found');
	}

	const playlistVideos = await Playlist.aggregate([
		{
			$match: {
				_id: new mongoose.Types.ObjectId(playlistId),
			},
		},
		{
			$lookup: {
				from: 'videos',
				localField: 'videos',
				foreignField: '_id',
				as: 'videos',
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
					{
						$unwind: '$owner',
					},
				],
			},
		},
		{
			$match: {
				'videos.isPublished': true,
			},
		},
		{
			$lookup: {
				from: 'users',
				localField: 'owner',
				foreignField: '_id',
				as: 'owner',
			},
		},
		{
			$addFields: {
				totalVideos: {
					$size: '$videos',
				},
				totalViews: {
					$sum: '$videos.views',
				},
				owner: {
					$first: '$owner',
				},
			},
		},
		{
			$project: {
				name: 1,
				description: 1,
				createdAt: 1,
				updatedAt: 1,
				totalVideos: 1,
				totalViews: 1,
				videos: {
					_id: 1,
					'videoFile.url': 1,
					'thumbnail.url': 1,
					title: 1,
					description: 1,
					duration: 1,
					createdAt: 1,
					views: 1,
				},
				owner: {
					username: 1,
					fullName: 1,
					'avatar.url': 1,
				},
			},
		},
	]);

	return res
		.status(200)
		.json(
			new ApiResponse(200, playlistVideos[0], 'playlist fetched successfully')
		);
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
	const { playlistId, videoId } = req.params;

	if (
		!(mongoose.isValidObjectId(playlistId) && mongoose.isValidObjectId(videoId))
	) {
		throw new ApiError(400, 'Invalid playlistId or videoId');
	}

	const playlist: PlaylistDocument | null = await Playlist.findById(playlistId);

	const video: VideoDocument | null = await Video.findById(videoId);

	if (!playlist) {
		throw new ApiError(404, 'Playlist not found');
	}

	if (!video) {
		throw new ApiError(404, 'video not found');
	}
	if (
		!video.isPublished &&
		video.owner?.toString() !== req.user?._id.toString()
	) {
		throw new ApiError(404, 'video is private');
	}
	if (playlist.owner?.toString() !== req.user?._id.toString()) {
		throw new ApiError(404, 'only owner can remove video from their playlist');
	}

	const updatedPlaylist = await Playlist.findByIdAndUpdate(
		playlist?._id,
		{
			$addToSet: {
				videos: videoId,
			},
		},
		{
			new: true,
		}
	);

	if (!updatedPlaylist) {
		throw new ApiError(400, 'failed to add video to playlist please try again');
	}

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				updatePlaylist,
				'video added to playlist successfully'
			)
		);
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
	const { playlistId, videoId } = req.params;

	if (
		!(mongoose.isValidObjectId(playlistId) && mongoose.isValidObjectId(videoId))
	) {
		throw new ApiError(400, 'Invalid playlistId or videoId');
	}

	const playlist: PlaylistDocument | null = await Playlist.findById(playlistId);

	const video: VideoDocument | null = await Video.findById(videoId);

	if (!playlist) {
		throw new ApiError(404, 'Playlist not found');
	}

	if (!video) {
		throw new ApiError(404, 'video not found');
	}

	if (playlist.owner?.toString() !== req.user?._id.toString()) {
		throw new ApiError(404, 'only owner can remove video from their playlist');
	}

	if (!playlist.videos.find(video._id)) {
		throw new ApiError(404, 'Video does not exist in playlist');
	}

	const updatedPlaylist = await Playlist.findByIdAndUpdate(
		playlist?._id,
		{
			$pull: {
				videos: videoId,
			},
		},
		{
			new: true,
		}
	);

	if (!updatedPlaylist) {
		throw new ApiError(
			400,
			'failed to remove video to playlist please try again'
		);
	}
	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				updatePlaylist,
				'video removed to playlist successfully'
			)
		);
});

const deletePlaylist = asyncHandler(async (req, res) => {
	const { playlistId } = req.params;

	if (!mongoose.isValidObjectId(playlistId)) {
		throw new ApiError(400, 'Invalid playlistId');
	}

	const playlist: PlaylistDocument | null = await Playlist.findById(playlistId);

	if (!playlist) {
		throw new ApiError(404, 'playlist not found');
	}

	if (playlist.owner?.toString() !== req.user?._id.toString()) {
		throw new ApiError(404, 'only owner can remove video from their playlist');
	}

	const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

	if (!deletePlaylist) {
		throw new ApiError(500, 'Error while deleting playlist');
	}

	return res
		.status(200)
		.json(new ApiResponse(200, {}, 'playlist deleted successfully'));
});

const updatePlaylist = asyncHandler(async (req, res) => {
	const { playlistId } = req.params;

	const { success } = UpdatePlaylistSchema.safeParse(req.body);

	if (!success) {
		throw new ApiError(400, 'give atLeast Valid name or description');
	}
	const { name, description }: Pick<PlaylistDocument, 'name' | 'description'> =
		req.body;

	const playlist: PlaylistDocument | null = await Playlist.findById(playlistId);

	if (!playlist) {
		throw new ApiError(404, 'playlist not found');
	}

	if (playlist.owner?.toString() !== req.user?._id.toString()) {
		throw new ApiError(404, 'only owner can remove video from their playlist');
	}

	const updateFields = {
		...(name !== undefined && { name }),
		...(description !== undefined && { description }),
	};

	const updatePlaylist = await Playlist.findByIdAndUpdate(
		playlist?._id,
		{
			$set: updateFields,
		},
		{ new: true }
	);

	return res
		.status(200)
		.json(
			new ApiResponse(200, updatePlaylist, 'playlist updated successfully')
		);
});

export {
	createPlaylist,
	getUserPlaylists,
	getPlaylistById,
	addVideoToPlaylist,
	removeVideoFromPlaylist,
	deletePlaylist,
	updatePlaylist,
};
