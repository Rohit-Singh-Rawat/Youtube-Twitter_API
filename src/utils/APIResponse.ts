interface ApiResponseType {
	statusCode: number;
	message: string;
	data: any;
	success: boolean;
}

export default class ApiResponse implements ApiResponseType {
	statusCode: number;
	message: string;
	success: boolean;
	data: any;

	constructor(statusCode: number, data: any, message: string = 'Success') {
		this.data = data;
		this.statusCode = statusCode;
		this.message = message;
		this.success = statusCode < 400;
	}
}
