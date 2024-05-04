import ApiResponse from '../utils/APIResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const healthCheck = asyncHandler(async (req, res) => {
	res.status(200).json(new ApiResponse(200, {}, 'OK'));
});

export { healthCheck };
