import mongoose from 'mongoose';
import SubscriptionType from '../types/subscription.type';

export interface SubscriptionDocument
	extends mongoose.Document,
		SubscriptionType {
	createdAt: Date;
	updatedAt: Date;
}
const SubscriptionSchema: mongoose.Schema<SubscriptionDocument> =
	new mongoose.Schema(
		{
			subscriber: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			},
			channel: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			},
		},
		{
			timestamps: true,
		}
	);
const Subscription: mongoose.Model<SubscriptionDocument> =
	mongoose.model<SubscriptionDocument>('Subscription', SubscriptionSchema);

export default Subscription;
