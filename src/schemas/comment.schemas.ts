import zod from 'zod';

export const AddCommentSchema = zod.object({
	content: zod.string().min(1).max(8192),
});
