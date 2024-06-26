import mongoose from 'mongoose';
import jwt, { Secret } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import UserType from '../types/user.type';
export interface UserDocument extends UserType, mongoose.Document {
	comparePassword: (userPassword: string) => Promise<boolean>;
	generateAccessToken: () => string;
	generateRefreshToken: () => string;
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
			match: /^\S+@\S+\.\S+$/,
		},
		fullName: {
			type: String,
			required: true,
			trim: true,
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
			minlength: 8,
		},
		refreshToken: {
			type: [String],
		},
	},
	{
		timestamps: true,
	}
);

userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	return next();
});

userSchema.methods.comparePassword = async function (userPassword: string) {
	return await bcrypt.compare(userPassword, this.password);
};

userSchema.methods.generateAccessToken = function () {
	return jwt.sign(
		{
			_id: this._id,
			email: this.email,
			username: this.username,
			fullName: this.fullName,
		},
		process.env.ACCESS_TOKEN_SECRET as Secret,
		{
			expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
		}
	);
};
userSchema.methods.generateRefreshToken = function () {
	return jwt.sign(
		{
			_id: this._id,
		},
		process.env.REFRESH_TOKEN_SECRET as Secret,
		{
			expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
		}
	);
};
const User: mongoose.Model<UserDocument> = mongoose.model<UserDocument>(
	'User',
	userSchema
);

export default User;
