import mongoose from 'mongoose';
import CommentType from '../types/comment.type';

export interface CommentDocument extends mongoose.Document, CommentType {
	createdAt: Date;
	updatedAt: Date;
}
const CommentSchema: mongoose.Schema<CommentDocument> = new mongoose.Schema(
	{
		content: {
			type: String,
			required: true,
			trim: true,
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
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
const Comment: mongoose.Model<CommentDocument> =
	mongoose.model<CommentDocument>('Comment', CommentSchema);

export default Comment;
