import zod from 'zod';

export const UpdateVideoSchema = zod.object({
	description: zod.string().min(1).max(8192),
	title: zod.string().min(1).max(8192),
});
export const PublishVideoSchema = zod.object({
	description: zod.string().min(1).max(8192),
	title: zod.string().min(1).max(8192),
});