import mongoose from 'mongoose';
import LikeType from '../types/like.type';

export interface LikeDocument extends mongoose.Document, LikeType {
	createdAt: Date;
	updatedAt: Date;
}
const LikeSchema: mongoose.Schema<LikeDocument> = new mongoose.Schema(
	{
		likedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		tweet: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Tweet',
		},
		comment: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Comment',
		},
		video: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Video',
		},
	},
	{
		timestamps: true,
	}
);
const Like: mongoose.Model<LikeDocument> = mongoose.model<LikeDocument>(
	'Like',
	LikeSchema
);

export default Like;
