import mongoose from 'mongoose';
interface UserDocument extends mongoose.Document {
	username: string;
	email: string;
	fullName: string;
	avatar: string;
	coverImage: string;
	watchHistory: mongoose.Schema.Types.ObjectId[];
	password: string;
	refreshToken: string;
	createdAt: Date;
	updatedAt: Date;
}

const userSchema: mongoose.Schema<UserDocument> = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			index: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		fullName: {
			type: String,
			required: true,
			trim: true,
			index: true,
		},
		avatar: {
			type: String,
			required: true,
		},
		coverImage: {
			type: String,
		},
		watchHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
		password: {
			type: String,
			required: [true, 'password is required'],
		},
		refreshToken: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

const User: mongoose.Model<UserDocument> = mongoose.model<UserDocument>(
	'User',
	userSchema
);

export default User;
