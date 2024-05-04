import mongoose, { AggregatePaginateModel } from 'mongoose';
import CommentType from '../types/comment.type';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

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
CommentSchema.plugin(mongooseAggregatePaginate);

const Comment: AggregatePaginateModel<CommentDocument> = mongoose.model<
	CommentDocument,
	AggregatePaginateModel<CommentDocument>
>('Comment', CommentSchema);

export default Comment;
