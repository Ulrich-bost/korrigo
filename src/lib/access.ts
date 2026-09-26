import { prisma } from "@/lib/prisma";
import { hasActiveSubscription } from "@/lib/auth";

export const FREE_PER_LEVEL = 3;

export async function canAccessSubject(
  subject: { isPremium: boolean },
  userId: string | null
) {
  if (!userId) return false;
  if (!subject.isPremium) return true;
  return hasActiveSubscription(userId);
}

export function subjectsForVisitor<T extends { isPremium: boolean }>(
  subjects: T[],
  isSubscribed: boolean
) {
  if (isSubscribed) return subjects;
  return subjects.filter((subject) => !subject.isPremium).slice(0, FREE_PER_LEVEL);
}
