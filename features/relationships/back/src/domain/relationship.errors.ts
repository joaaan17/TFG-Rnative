/**
 * Errores de dominio para Relationships
 */

export class RelationshipConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RelationshipConflictError';
  }
}

export class RelationshipForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RelationshipForbiddenError';
  }
}

export class RelationshipNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RelationshipNotFoundError';
  }
}
