import mongoose from 'mongoose';
import PlaylistType from '../types/playlist.type';

export interface PlaylistDocument extends mongoose.Document, PlaylistType {
	createdAt: Date;
	updatedAt: Date;
}
const PlaylistSchema: mongoose.Schema<PlaylistDocument> = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			required: true,
			trim: true,
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		videos: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: 'Video',
		},
	},
	{
		timestamps: true,
	}
);
const Playlist: mongoose.Model<PlaylistDocument> =
	mongoose.model<PlaylistDocument>('Playlist', PlaylistSchema);

export default Playlist;
