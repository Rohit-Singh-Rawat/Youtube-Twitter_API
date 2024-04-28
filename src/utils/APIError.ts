interface APIErrorType {
	statusCode: number;
	errors: any[];
	message: string;
	data: any;
	success: boolean;
	stack?: string;
}

class APIError extends Error implements APIErrorType {
	statusCode: number;
	errors: any[];
	success: boolean;
	data: any;

	constructor(
		statusCode: number,
		message: string = 'Something went wrong',
		errors: any[] = [],
		data: any = {},
		stack: string = ''
	) {
		super(message);
		this.statusCode = statusCode;
		this.message = message;
		this.errors = errors;
		this.data = null;
		this.success =false

		if (stack) {
			this.stack = stack;
		} else {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}
