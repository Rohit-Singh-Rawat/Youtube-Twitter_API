interface APIResponseType {
	statusCode: number;
	message: string;
	data: any;
	success: boolean;
}

class APIResponse implements APIResponseType {
	statusCode: number;
	message: string;
	success: boolean;
	data: any;

	constructor(statusCode: number, message: string = 'Success', data: any) {
		this.data = data;
		this.statusCode = statusCode;
		this.message = message;
		this.success = statusCode < 400;
	}
}
