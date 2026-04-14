import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { suggestProfilesUseCase } from '../../../../profile/back/src/config/profile.wiring';
import {
  requestFriendship,
  acceptFriendship,
  rejectFriendship,
  deleteFriend,
  listFriends,
  listPendingRequests,
} from '../config/relationships.wiring';
import {
  RelationshipConflictError,
  RelationshipForbiddenError,
  RelationshipNotFoundError,
} from '../domain/relationship.errors';

function jsonOk<T>(res: Response, data: T, status = 200) {
  res.status(status).json({ ok: true, data });
}

function jsonError(res: Response, error: string, status: number) {
  res.status(status).json({ ok: false, error });
}

function getCurrentUserId(req: Request): string | null {
  return req.auth?.userId ?? null;
}

function isValidObjectId(id: string): boolean {
  return mongoose.isValidObjectId(id);
}

export async function requestController(req: Request, res: Response) {
  const userId = getCurrentUserId(req);
  if (!userId) {
    jsonError(res, 'Unauthorized', 401);
    return;
  }
  const targetUserId = req.body?.targetUserId;
  if (typeof targetUserId !== 'string' || !targetUserId.trim()) {
    jsonError(res, 'targetUserId is required', 400);
    return;
  }
  if (!isValidObjectId(targetUserId)) {
    jsonError(res, 'Invalid targetUserId', 400);
    return;
  }
  try {
    const result = await requestFriendship({
      currentUserId: userId,
      targetUserId: targetUserId.trim(),
    });
    jsonOk(res, result, 201);
  } catch (e) {
    if (e instanceof RelationshipConflictError) {
      jsonError(res, e.message, 409);
      return;
    }
    if (e instanceof RelationshipForbiddenError) {
      jsonError(res, e.message, 403);
      return;
    }
    jsonError(res, e instanceof Error ? e.message : 'Error interno', 500);
  }
}

export async function acceptController(req: Request, res: Response) {
  const userId = getCurrentUserId(req);
  if (!userId) {
    jsonError(res, 'Unauthorized', 401);
    return;
  }
  const fromUserId = req.body?.fromUserId;
  if (typeof fromUserId !== 'string' || !fromUserId.trim()) {
    jsonError(res, 'fromUserId is required', 400);
    return;
  }
  if (!isValidObjectId(fromUserId)) {
    jsonError(res, 'Invalid fromUserId', 400);
    return;
  }
  try {
    const result = await acceptFriendship({
      currentUserId: userId,
      fromUserId: fromUserId.trim(),
    });
    jsonOk(res, result);
  } catch (e) {
    if (e instanceof RelationshipNotFoundError) {
      jsonError(res, e.message, 404);
      return;
    }
    if (e instanceof RelationshipForbiddenError) {
      jsonError(res, e.message, 403);
      return;
    }
    jsonError(res, e instanceof Error ? e.message : 'Error interno', 500);
  }
}

export async function rejectController(req: Request, res: Response) {
  const userId = getCurrentUserId(req);
  if (!userId) {
    jsonError(res, 'Unauthorized', 401);
    return;
  }
  const fromUserId = req.body?.fromUserId;
  if (typeof fromUserId !== 'string' || !fromUserId.trim()) {
    jsonError(res, 'fromUserId is required', 400);
    return;
  }
  if (!isValidObjectId(fromUserId)) {
    jsonError(res, 'Invalid fromUserId', 400);
    return;
  }
  try {
    await rejectFriendship({
      currentUserId: userId,
      fromUserId: fromUserId.trim(),
    });
    jsonOk(res, { message: 'Request rejected' });
  } catch (e) {
    if (e instanceof RelationshipNotFoundError) {
      jsonError(res, e.message, 404);
      return;
    }
    if (e instanceof RelationshipForbiddenError) {
      jsonError(res, e.message, 403);
      return;
    }
    jsonError(res, e instanceof Error ? e.message : 'Error interno', 500);
  }
}

export async function deleteFriendController(req: Request, res: Response) {
  const userId = getCurrentUserId(req);
  if (!userId) {
    jsonError(res, 'Unauthorized', 401);
    return;
  }
  const friendUserId = req.params.friendUserId;
  if (!friendUserId || !isValidObjectId(friendUserId)) {
    jsonError(res, 'Invalid friendUserId', 400);
    return;
  }
  try {
    await deleteFriend({
      currentUserId: userId,
      friendUserId,
    });
    jsonOk(res, { message: 'Friend removed' });
  } catch (e) {
    if (e instanceof RelationshipNotFoundError) {
      jsonError(res, e.message, 404);
      return;
    }
    jsonError(res, e instanceof Error ? e.message : 'Error interno', 500);
  }
}

export async function listFriendsController(req: Request, res: Response) {
  const userId = getCurrentUserId(req);
  if (!userId) {
    jsonError(res, 'Unauthorized', 401);
    return;
  }
  const search = typeof req.query.search === 'string' ? req.query.search : '';
  const pageRaw = req.query.page;
  const limitRaw = req.query.limit;
  const page = typeof pageRaw === 'string' ? parseInt(pageRaw, 10) : 1;
  const limit = typeof limitRaw === 'string' ? parseInt(limitRaw, 10) : 20;
  if (search.length > 50) {
    jsonError(res, 'Search query too long', 400);
    return;
  }
  try {
    const result = await listFriends({
      currentUserId: userId,
      search: search || undefined,
      page: Number.isNaN(page) ? 1 : page,
      limit: Math.min(50, Number.isNaN(limit) ? 20 : limit),
    });
    jsonOk(res, result);
  } catch (e) {
    jsonError(res, e instanceof Error ? e.message : 'Error interno', 500);
  }
}

export async function listPendingRequestsController(
  req: Request,
  res: Response,
) {
  const userId = getCurrentUserId(req);
  if (!userId) {
    jsonError(res, 'Unauthorized', 401);
    return;
  }
  try {
    const result = await listPendingRequests({ currentUserId: userId });
    jsonOk(res, result);
  } catch (e) {
    jsonError(res, e instanceof Error ? e.message : 'Error interno', 500);
  }
}

/** Perfiles registrados para añadir amigos (excluye tú, amigos y pendientes). Respuesta plana `{ items }` para el cliente de perfil. */
export async function recommendUsersController(req: Request, res: Response) {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      jsonError(res, 'Unauthorized', 401);
      return;
    }
    const limitRaw = req.query.limit;
    const pageRaw = req.query.page;
    const page = typeof pageRaw === 'string' ? parseInt(pageRaw, 10) || 1 : 1;
    const limit = Math.min(
      100,
      typeof limitRaw === 'string' ? parseInt(limitRaw, 10) || 50 : 50,
    );
    const result = await suggestProfilesUseCase.execute(userId, limit, page);
    res.status(200).json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Error al obtener recomendaciones';
    res.status(500).json({ message });
  }
}
