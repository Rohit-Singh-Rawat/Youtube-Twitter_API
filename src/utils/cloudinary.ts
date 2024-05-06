import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import ApiError from './APIError';
import { extractPublicId } from 'cloudinary-build-url';

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath: string) => {
	try {
		if (!localFilePath) return null;
		const response = await cloudinary.uploader.upload(localFilePath, {
			resource_type: 'auto',
		});
		console.log('file is uploaded on Cloudinary');
		fs.unlinkSync(localFilePath);
		return response;
	} catch (error) {
		fs.unlinkSync(localFilePath);
		return null;
	}
};

const deleteFromCloudinary = async (publicUrl: string) => {
	try {
		if (!publicUrl) return null;

		const publicId = extractPublicId(publicUrl);
		const response = await cloudinary.uploader.destroy(publicId);
		return response;
	} catch (error) {
		throw new ApiError(400, 'Error while deleting resource from cloudinary');
	}
};

export { uploadOnCloudinary, deleteFromCloudinary };
