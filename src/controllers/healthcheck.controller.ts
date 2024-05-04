import ApiResponse from '../utils/APIResponse';
import { asyncHandler } from '../utils/asyncHandler';

const healthCheck = asyncHandler(async (req, res) => {
	res.status(200).json(new ApiResponse(200, {}, 'OK'));
});

export { healthCheck };
