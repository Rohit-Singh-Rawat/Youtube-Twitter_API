import mongoose from 'mongoose';

export default interface SubscriptionType {
	subscriber: mongoose.ObjectId;
	channel: mongoose.ObjectId;
}
