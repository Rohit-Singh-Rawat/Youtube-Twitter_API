import mongoose from 'mongoose';

export default interface CommentType {
	content: string;
	owner: mongoose.Types.ObjectId;
	video: mongoose.Types.ObjectId;
}
