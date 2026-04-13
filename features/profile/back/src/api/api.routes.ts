import { Router } from 'express';
import {
  optionalAuth,
  requireAuth,
} from '../../../../auth/back/src/api/auth.middleware';
import {
  awardExperienceController,
  getProfileController,
  searchProfilesController,
} from './profile.controller';

const router = Router();

router.get('/search', requireAuth, searchProfilesController);
router.post('/experience/award', requireAuth, awardExperienceController);
/** Sugerencias de amigos: solo GET /api/relationships/recommend-users (aquí GET /:id captura cualquier segmento). */
router.get('/:id', optionalAuth, getProfileController);

export default router;
