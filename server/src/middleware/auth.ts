import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'

export type AuthUser = {
  id: string
  email: string
  name: string
  role: 'anggota' | 'pustakawan' | 'admin'
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const token = header.slice(7)
  try {
    const secret = process.env.JWT_SECRET || 'dev-secret-change-me'
    const payload = jwt.verify(token, secret) as AuthUser & { sub?: string }
    req.user = {
      id: payload.id || payload.sub || '',
      email: payload.email,
      name: payload.name,
      role: payload.role,
    }
    if (!req.user.id) return res.status(401).json({ error: 'Unauthorized' })
    next()
  } catch {
    return res.status(401).json({ error: 'Sesi tidak valid atau kedaluwarsa' })
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Hanya admin yang dapat mengakses.' })
  }
  next()
}

/** Opsional: validasi sesi masih ada di DB */
export async function attachSessionCheck(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next()
  // no-op ringan; bisa dicek token hash di tabel Session bila diperlukan
  next()
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email: email.toLowerCase() } })
}
