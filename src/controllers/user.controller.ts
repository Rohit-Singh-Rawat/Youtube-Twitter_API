import { asyncHandler } from "../utils/asyncHandler";

export const registerUser = asyncHandler( async(req, res)=>{
    res.status(200).json({
        message:"OK JI"
    })
})