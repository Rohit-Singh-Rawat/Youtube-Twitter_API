import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import ApiError from '../utils/APIError';
import { asyncHandler } from '../utils/asyncHandler';
import User from '../models/user.model';
import mongoose from 'mongoose';
import UserType from '../types/user.type';
import express, { NextFunction } from 'express';

declare global {
	namespace Express {
		interface Request {
			user?: any;
		}
	}
}

export const authentication = asyncHandler(
	async (req: express.Request, res: express.Response, next: NextFunction) => {
		try {
			const token =
				req.cookies?.accessToken ||
				req.header('Authorization')?.replace('Bearer ', '');
			if (!token) {
				throw new ApiError(401, 'Unauthorized request');
			}
			const decodedToken = jwt.verify(
				token,
				process.env.ACCESS_TOKEN_SECRET as Secret
			) as JwtPayload;
			if (!decodedToken?._id || !mongoose.isValidObjectId(decodedToken?._id)) {
				throw new ApiError(401, 'Invalid access Token');
			}
			const user = await User.findById(decodedToken?._id).select(
				'-password -refreshToken'
			);
			if (!user) {
				throw new ApiError(401, 'Invalid access Token');
			}

			req.user = user;
			next();
		} catch (error) {
			throw new ApiError(
				401,
				(error as Error)?.message || 'Invalid Access Token'
			);
		}
	}
);
