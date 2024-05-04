import zod from 'zod';

export const CreateTweetSchema = zod.object({
	content: zod.string().min(1).max(8192),
});
export const UpdateTweetSchema = zod.object({
	content: zod.string().min(1).max(8192),
});