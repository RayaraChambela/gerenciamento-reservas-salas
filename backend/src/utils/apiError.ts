import { Response } from 'express';

export function sendError(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: unknown
) {
  const body: { error: string; code: string; details?: unknown } = {
    error: message,
    code,
  };

  if (details !== undefined) {
    body.details = details;
  }

  return res.status(status).json(body);
}
