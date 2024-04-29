import multer from 'multer';
import { nanoid } from 'nanoid';

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, '../../public/temp');
	},
	filename: function (req, file, cb) {
		cb(null, nanoid());
	},
});

const upload = multer({ storage });
export default upload;
