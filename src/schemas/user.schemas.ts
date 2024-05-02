import zod from 'zod';

export const UserRegisterSchema = zod.object({
	username: zod.string().max(20).toLowerCase(),
	email: zod.string().email(),
	fullName: zod.string().max(50),
	password: zod.string().min(8),
});

export const UserLoginSchema = zod.object({
	loginIdentity: zod.union([
		zod.string().max(20).toLowerCase(),
		zod.string().email(),
	]),
	password: zod.string().min(8),
});

export const ChangePasswordSchema = zod.object({
	oldPassword: zod.string().min(8),
	newPassword: zod.string().min(8),
});

export const ChangeUserDetailSchema = zod
	.object({
		email: zod.string().email().optional(),
		fullName: zod.string().max(50).optional(),
	})
	.refine((data) => {
		if (data.email === undefined && data.fullName === undefined) {
			return false;
		}
	});
