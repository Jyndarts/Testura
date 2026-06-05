import { Request, Response, NextFunction } from "express";
import { signupSchema, loginSchema, refreshSchema } from "../validators/auth.validators";
import * as authService from "../services/auth.service";
import { successResponse, errorResponse } from "../utils/response.utils";

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(errorResponse(parsed.error.errors[0].message));
    return;
  }

  const result = await authService.signup(parsed.data);
  res.status(201).json(successResponse(result));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(errorResponse(parsed.error.errors[0].message));
    return;
  }

  const result = await authService.login(parsed.data);
  res.json(successResponse(result));
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(errorResponse(parsed.error.errors[0].message));
    return;
  }

  const result = await authService.refresh(parsed.data.refreshToken);
  res.json(successResponse(result));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token && req.user) {
    await authService.logout(req.user.userId, token);
  }
  res.json(successResponse(null, "Logged out"));
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.getMe(req.user!.userId);
  res.json(successResponse(result));
});
