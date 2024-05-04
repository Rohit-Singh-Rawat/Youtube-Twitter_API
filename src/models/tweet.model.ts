import mongoose from 'mongoose';
import TweetType from '../types/tweet.type';

export interface TweetDocument extends mongoose.Document, TweetType {
	createdAt: Date;
	updatedAt: Date;
}
const TweetSchema: mongoose.Schema<TweetDocument> = new mongoose.Schema(
	{
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',

		},
		content: {
			type: String,
            required:true
		},
	},
	{
		timestamps: true,
	}
);
const Tweet: mongoose.Model<TweetDocument> = mongoose.model<TweetDocument>(
	'Tweet',
	TweetSchema
);

export default Tweet;
