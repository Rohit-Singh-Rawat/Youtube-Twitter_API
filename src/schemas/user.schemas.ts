import zod from 'zod';

export const UserRegisterSchema = zod.object({
	username: zod.string().max(20).toLowerCase(),
	email: zod.string().email(),
	fullName: zod.string().max(50),
	password: zod.string().min(8),
});
