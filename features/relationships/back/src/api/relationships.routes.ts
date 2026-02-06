import { Router } from 'express';
import { requireAuth } from '../../../../auth/back/src/api/auth.middleware';
import {
  requestController,
  acceptController,
  rejectController,
  deleteFriendController,
  listFriendsController,
  listPendingRequestsController,
} from './relationships.controller';

const router = Router();

router.use(requireAuth);

router.post('/request', requestController);
router.post('/accept', acceptController);
router.post('/reject', rejectController);
router.delete('/friend/:friendUserId', deleteFriendController);
router.get('/friends', listFriendsController);
router.get('/pending-requests', listPendingRequestsController);

export default router;
