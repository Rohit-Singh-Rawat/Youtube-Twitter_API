import { NextFunction, Request, Response } from 'express';

export const asyncHandler = (
	requestHandler: (req: Request, res: Response, next: NextFunction) => unknown
) => {
	return (req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(requestHandler(req, res, next)).catch((err: Error)=> {
            next(err)
        });
	};
};
