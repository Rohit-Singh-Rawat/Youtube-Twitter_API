import mongoose from 'mongoose';

export default interface UserType {
	username: string;
	email: string;
	fullName: string;
	avatar: string;
	coverImage: string;
	watchHistory: mongoose.Types.ObjectId[];
	password: string;
	refreshToken: string;
	
}
