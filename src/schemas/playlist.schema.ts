import zod from 'zod';
export const CreatePlaylistSchema = zod.object({
	name: zod.string().min(1).trim(),
	description: zod.string().min(1).trim().optional(),
});
export const UpdatePlaylistSchema = zod
	.object({
		name: zod.string().min(1).trim().optional(),
		description: zod.string().min(1).trim().optional(),
	})
	.refine((data) => {
		if (data.name === undefined && data.description === undefined) {
			return false;
		}
	});
