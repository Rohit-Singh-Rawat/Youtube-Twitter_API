import mongoose from 'mongoose';

export default interface VideoType {
	name: string;
	owner: mongoose.Types.ObjectId;
	videos: mongoose.Types.ObjectId[];
	description: string;
}
