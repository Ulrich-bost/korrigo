import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { rethrowNavigationError } from "./navigation-error";
import type { Role } from "@prisma/client";

const COOKIE_NAME = "univ-sujets-session";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  cookies().delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  try {
    return await prisma.user.findUnique({
      where: { id: session.id },
      include: { subscription: true },
    });
  } catch (error) {
    rethrowNavigationError(error);
    return null;
  }
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    const sub = await prisma.subscription.findUnique({ where: { userId } });
    if (!sub || sub.status !== "ACTIVE") return false;
    if (sub.currentPeriodEnd && sub.currentPeriodEnd < new Date()) return false;
    return true;
  } catch (error) {
    rethrowNavigationError(error);
    return false;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}
