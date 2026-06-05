import prisma from "../lib/prisma";
import { hashPassword, comparePassword } from "../utils/password.utils";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.utils";
import { AppError } from "../utils/response.utils";

function excludePassword(user: { passwordHash: string; [key: string]: unknown }) {
  const { passwordHash, ...rest } = user;
  return rest;
}

export async function signup(data: {
  name: string;
  email: string;
  password: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new AppError("Email already in use", 409);
  }

  const passwordHash = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
    },
  });

  const accessToken = generateAccessToken({ userId: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: excludePassword(user),
    accessToken,
    refreshToken,
  };
}

export async function login(data: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const valid = await comparePassword(data.password, user.passwordHash);
  if (!valid) {
    throw new AppError("Invalid email or password", 401);
  }

  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

  const accessToken = generateAccessToken({ userId: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: excludePassword(user),
    accessToken,
    refreshToken,
  };
}

export async function refresh(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError("Invalid refresh token", 401);
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });
  if (!stored) {
    throw new AppError("Refresh token not found", 401);
  }

  if (stored.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    throw new AppError("Refresh token expired", 401);
  }

  await prisma.refreshToken.delete({ where: { id: stored.id } });

  const newRefreshToken = generateRefreshToken({
    userId: payload.userId,
    email: payload.email,
  });

  await prisma.refreshToken.create({
    data: {
      userId: payload.userId,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const accessToken = generateAccessToken({
    userId: payload.userId,
    email: payload.email,
  });

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(userId: string, token: string) {
  await prisma.refreshToken.deleteMany({
    where: { userId, token },
  });
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return { user: excludePassword(user) };
}
