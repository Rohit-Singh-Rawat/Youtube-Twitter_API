import zod from 'zod';

export const AddCommentSchema = zod.object({
	content: zod.string().min(1).max(8192),
});
export const UpdateVideoSchema = zod.object({
	description: zod.string().min(1).max(8192),
	title: zod.string().min(1).max(8192),
});
