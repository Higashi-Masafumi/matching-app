export class DomainError extends Error {
  constructor(
    message: string,
    public readonly status: number = 400,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 422, details);
    this.name = 'ValidationError';
  }
}
