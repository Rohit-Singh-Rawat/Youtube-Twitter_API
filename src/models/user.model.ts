import mongoose from 'mongoose';
import jwt, { Secret } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
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

userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	return next();
});

userSchema.methods.comparePassword = async function(userPassword: string)  {
	return await bcrypt.compare(userPassword, this.password);
};

userSchema.methods.generateAccessToken =  function(){
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
}
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
