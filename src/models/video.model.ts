import mongoose, { AggregatePaginateModel } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import VideoType from '../types/video.type';

export interface VideoDocument extends VideoType, mongoose.Document {
	createdAt: Date;
	updatedAt: Date;
}

const videoSchema: mongoose.Schema<VideoDocument> = new mongoose.Schema(
	{
		videoFile: {
			type: String,
			required: true,
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		duration: {
			type: String,
			required: true,
		},
		thumbnail: {
			type: String,
			required: true,
		},
		views: {
			type: Number,
			required: true,
			default: 0,
		},
		isPublished: {
			type: Boolean,
			required: true,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

videoSchema.index(
	{ title: 'text', description: 'text' },
	{
		weights: {
			title: 3,
			description: 2,
		},
		name: 'search-videos',
		default_language: 'english',
		background: true,
	}
);

videoSchema.plugin(mongooseAggregatePaginate);

const Video: AggregatePaginateModel<VideoDocument> = mongoose.model<
	VideoDocument,
	AggregatePaginateModel<VideoDocument>
>('Video', videoSchema);

export default Video;
