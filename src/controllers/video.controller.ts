import mongoose, { isValidObjectId } from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler';

const getAllVideos = asyncHandler(async (req, res) => {
	const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
});

const publishAVideo = asyncHandler(async (req, res) => {
	const { title, description } = req.body;
});

const getVideoById = asyncHandler(async (req, res) => {
	const { videoId } = req.params;
});

const updateVideo = asyncHandler(async (req, res) => {
	const { videoId } = req.params;
});

const deleteVideo = asyncHandler(async (req, res) => {
	const { videoId } = req.params;
});

const togglePublishStatus = asyncHandler(async (req, res) => {
	const { videoId } = req.params;
});

export {
	getAllVideos,
	publishAVideo,
	getVideoById,
	updateVideo,
	deleteVideo,
	togglePublishStatus,
};
