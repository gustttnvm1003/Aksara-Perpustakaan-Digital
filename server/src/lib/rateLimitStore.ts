import { prisma } from './prisma.js'

/**
 * Rate limit berbasis database (bertahan restart server).
 * key: email atau IP, action: string aksi, max: batas, windowMs: jendela waktu.
 */
export async function checkRateLimit(
  key: string,
  action: string,
  max: number,
  windowMs: number,
): Promise<{ allowed: boolean; remaining: number; retryAfterSec?: number }> {
  const now = new Date()
  const existing = await prisma.rateLimit.findUnique({
    where: { key_action: { key, action } },
  })

  if (!existing) {
    await prisma.rateLimit.create({
      data: { key, action, count: 1, windowStart: now },
    })
    return { allowed: true, remaining: max - 1 }
  }

  const elapsed = now.getTime() - existing.windowStart.getTime()
  if (elapsed > windowMs) {
    await prisma.rateLimit.update({
      where: { id: existing.id },
      data: { count: 1, windowStart: now },
    })
    return { allowed: true, remaining: max - 1 }
  }

  if (existing.count >= max) {
    const retryAfterSec = Math.ceil((windowMs - elapsed) / 1000)
    return { allowed: false, remaining: 0, retryAfterSec }
  }

  await prisma.rateLimit.update({
    where: { id: existing.id },
    data: { count: existing.count + 1 },
  })
  return { allowed: true, remaining: max - existing.count - 1 }
}
