import { Router } from 'express';
import { getProfileController } from './profile.controller';

const router = Router();

router.get('/:id', getProfileController);

export default router;
