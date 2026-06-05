export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function successResponse(data: unknown, message = "OK") {
  return { success: true, data, message };
}

export function errorResponse(message: string) {
  return { success: false, message };
}
