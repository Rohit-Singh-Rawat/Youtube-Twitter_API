import mongoose from 'mongoose';

export default interface TweetType {
	owner: mongoose.Types.ObjectId;
	content: string;
}
