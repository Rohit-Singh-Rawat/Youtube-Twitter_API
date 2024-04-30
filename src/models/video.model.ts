import mongoose from 'mongoose';
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

videoSchema.plugin(mongooseAggregatePaginate);

const Video: mongoose.Model<VideoDocument> = mongoose.model<VideoDocument>(
	'Video',
	videoSchema
);

export default Video;
