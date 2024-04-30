import mongoose from "mongoose";

export default interface VideoType {
	videoFile: string;
	owner: mongoose.Types.ObjectId;
	title: string;
	description: string;
	duration: string;
	thumbnail: string;
	views: number;
	isPublished: boolean;
	
}