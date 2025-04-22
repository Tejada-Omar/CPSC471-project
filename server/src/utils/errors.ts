// Useful when returning a fatal error from a helper function (eg. a long transaction)
export class DbError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'DbError';
  }
}
