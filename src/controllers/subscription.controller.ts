import mongoose, { isValidObjectId } from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler';
import ApiError from '../utils/APIError';
import User, { UserDocument } from '../models/user.model';
import Subscription, {
	SubscriptionDocument,
} from '../models/subscription.model';
import ApiResponse from '../utils/APIResponse';

const toggleSubscription = asyncHandler(async (req, res) => {
	const { channelId } = req.params;

	if (!mongoose.isValidObjectId(channelId)) {
		throw new ApiError(400, 'Invalid channelId');
	}

	const channel: UserDocument | null = await User.findById(channelId);

	if (!channel) {
		throw new ApiError(404, 'channel not found');
	}

	const subscribedAlready = await Subscription.findOne({
		subscriber: req.user?._id,
		channel: channelId,
	});

	if (subscribedAlready) {
		await Subscription.findByIdAndDelete(subscribedAlready?._id);

		return res
			.status(200)
			.json(
				new ApiResponse(200, { isSubscribed: false }, 'Unsubscribed channel')
			);
	}

	const subscribe: SubscriptionDocument = await Subscription.create({
		subscriber: req.user?._id,
		channel: channelId,
	});

	if (!subscribe) {
		throw new ApiError(
			500,
			'Error while subscribing the channel!!! Pls try again'
		);
	}

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				{ isSubscribed: true },
				'channel subscribed successfully'
			)
		);
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
	const { channelId } = req.params;

	if (!mongoose.isValidObjectId(channelId)) {
		throw new ApiError(400, 'Invalid channelId');
	}

	const channel: UserDocument | null = await User.findById(channelId);

	if (!channel) {
		throw new ApiError(404, 'channel not found');
	}
	const subscribers = await Subscription.aggregate([
		{
			$match: {
				channel: new mongoose.Types.ObjectId(channelId),
			},
		},
		{
			$lookup: {
				from: 'users',
				foreignField: '_id',
				localField: 'subscriber',
				as: 'subscriber',
				pipeline: [
					{
						$lookup: {
							from: 'subscriptions',
							localField: '_id',
							foreignField: 'channel',
							as: 'subscriberSubscriptions',
						},
					},
					{
						$addFields: {
							isFollowingChannel: {
								$cond: {
									if: {
										$in: [channelId, '$subscriberSubscriptions.subscriber'],
									},
									then: true,
									else: false,
								},
							},
							subscribersCount: {
								$size: '$subscriberSubscriptions',
							},
						},
					},
					{
						$project: {
							username: 1,
							fullName: 1,
							avatar: 1,
							subscribersCount: 1,
							isFollowingChannel: 1,
						},
					},
				],
			},
		},
		{
			$unwind: '$subscriber',
		},
		{
			$replaceRoot: { newRoot: '$subscriber' },
		},
	]);

	return res
		.status(200)
		.json(new ApiResponse(200, subscribers, 'fetched all subscribers'));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
	const { subscriberId } = req.params;

	if (!mongoose.isValidObjectId(subscriberId)) {
		throw new ApiError(400, 'Invalid subscriberId');
	}

	const subscriber: UserDocument | null = await User.findById(subscriberId);

	if (!subscriber) {
		throw new ApiError(404, 'subscriber not found');
	}
	const channels = await Subscription.aggregate([
		{
			$match: {
				subscriber: new mongoose.Types.ObjectId(subscriberId),
			},
		},
		{
			$lookup: {
				from: 'users',
				foreignField: '_id',
				localField: 'channel',
				as: 'channel',
				pipeline: [
					{
						$lookup: {
							from: 'subscriptions',
							localField: '_id',
							foreignField: 'channel',
							as: 'subscribersOfChannel',
						},
					},
					{
						$lookup: {
							from: 'videos',
							localField: '_id',
							foreignField: 'owner',
							as: 'videos',
						},
					},
					{
						$addFields: {
							subscribersCount: {
								$size: '$subscribersOfChannel',
							},
							latestVideo: {
								$last: '$videos',
							},
						},
					},
					{
						$project: {
							username: 1,
							fullName: 1,
							avatar: 1,
							subscribersCount: 1,
							latestVideo: 1,
						},
					},
				],
			},
		},
		{
			$unwind: '$channel',
		},
		{
			$replaceRoot: { newRoot: '$channel' },
		},
	]);
	return res
		.status(200)
		.json(new ApiResponse(200, channels, 'fetched all channels'));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
