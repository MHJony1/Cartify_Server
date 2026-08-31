import { Router } from 'express';
import { uploadImage } from './upload.controller';
import { upload } from '../../middleware/upload';

const router = Router();

router.post('/', upload.single('image'), uploadImage);

export const UploadRoutes = router;
