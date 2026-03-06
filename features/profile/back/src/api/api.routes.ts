import { Router } from 'express';
import { requireAuth } from '../../../../auth/back/src/api/auth.middleware';
import {
  awardExperienceController,
  getProfileController,
  searchProfilesController,
} from './profile.controller';

const router = Router();

router.get('/search', requireAuth, searchProfilesController);
router.post('/experience/award', requireAuth, awardExperienceController);
router.get('/:id', getProfileController);

export default router;
