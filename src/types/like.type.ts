import mongoose from 'mongoose';

export default interface LikeType {
	video: mongoose.Types.ObjectId;
	comment: mongoose.Types.ObjectId;
	likedBy: mongoose.Types.ObjectId;
	tweet: mongoose.Types.ObjectId;
}
