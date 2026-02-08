import mongoose from 'mongoose';
import type { RelationshipRepository } from '../../../domain/relationship.ports';
import type { Relationship } from '../../../domain/relationship.types';
import { RelationshipModel } from './relationship.model';

function toObjectId(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}

export class MongoRelationshipRepository implements RelationshipRepository {
  async findByPair(userAId: string, userBId: string): Promise<Relationship | null> {
    const doc = await RelationshipModel.findOne({
      userAId: toObjectId(userAId),
      userBId: toObjectId(userBId),
    })
      .lean()
      .exec();
    if (!doc) return null;
    return this.mapToRelationship(doc);
  }

  async create(data: {
    userAId: string;
    userBId: string;
    requesterId: string;
    status: string;
  }): Promise<Relationship> {
    const doc = await RelationshipModel.create({
      userAId: toObjectId(data.userAId),
      userBId: toObjectId(data.userBId),
      requesterId: toObjectId(data.requesterId),
      status: data.status,
    });
    return this.mapToRelationship(doc);
  }

  async updateStatus(
    userAId: string,
    userBId: string,
    status: string,
  ): Promise<Relationship> {
    const doc = await RelationshipModel.findOneAndUpdate(
      { userAId: toObjectId(userAId), userBId: toObjectId(userBId) },
      { $set: { status } },
      { new: true },
    )
      .lean()
      .exec();
    if (!doc) throw new Error('Relationship not found');
    return this.mapToRelationship(doc);
  }

  async deleteByPair(userAId: string, userBId: string): Promise<void> {
    await RelationshipModel.deleteOne({
      userAId: toObjectId(userAId),
      userBId: toObjectId(userBId),
    }).exec();
  }

  async findAcceptedFriendIds(userId: string): Promise<string[]> {
    const docs = await RelationshipModel.find({
      status: 'accepted',
      $or: [{ userAId: toObjectId(userId) }, { userBId: toObjectId(userId) }],
    })
      .select('userAId userBId')
      .lean()
      .exec();
    const oid = toObjectId(userId);
    return docs.map((d) => {
      const a = d.userAId.toString();
      const b = d.userBId.toString();
      return d.userAId.equals(oid) ? b : a;
    });
  }

  async countAcceptedFriends(userId: string): Promise<number> {
    const count = await RelationshipModel.countDocuments({
      status: 'accepted',
      $or: [{ userAId: toObjectId(userId) }, { userBId: toObjectId(userId) }],
    }).exec();
    return count;
  }

  async findPendingRequesterIds(userId: string): Promise<string[]> {
    const docs = await RelationshipModel.find({
      status: 'pending',
      $or: [{ userAId: toObjectId(userId) }, { userBId: toObjectId(userId) }],
    })
      .select('requesterId')
      .lean()
      .exec();
    return docs.map((d) => String(d.requesterId));
  }

  private mapToRelationship(doc: {
    _id: unknown;
    userAId: unknown;
    userBId: unknown;
    requesterId: unknown;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }): Relationship {
    return {
      id: String(doc._id),
      userAId: String(doc.userAId),
      userBId: String(doc.userBId),
      requesterId: String(doc.requesterId),
      status: doc.status as Relationship['status'],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
