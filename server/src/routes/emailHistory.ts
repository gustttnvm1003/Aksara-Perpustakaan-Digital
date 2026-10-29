import { Router } from 'express'
import { z } from 'zod'
import type { EmailStatus, EmailType } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  type: z.enum(['referral', 'reset_password', 'verification', 'other']).optional(),
  status: z.enum(['pending', 'sent', 'failed']).optional(),
  q: z.string().max(200).optional(),
})

router.get('/', requireAuth, async (req, res) => {
  const parsed = querySchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Parameter tidak valid', details: parsed.error.flatten() })
  }
  const { page, limit, type, status, q } = parsed.data
  const isAdmin = req.user!.role === 'admin'

  const where: Record<string, unknown> = {}
  if (!isAdmin) {
    where.OR = [{ userId: req.user!.id }, { recipientEmail: req.user!.email.toLowerCase() }]
  }
  if (type) where.type = type as EmailType
  if (status) where.status = status as EmailStatus
  if (q?.trim()) {
    const term = q.trim()
    where.AND = [
      {
        OR: [
          { recipientEmail: { contains: term, mode: 'insensitive' } },
          { subject: { contains: term, mode: 'insensitive' } },
        ],
      },
    ]
  }

  const [total, items] = await Promise.all([
    prisma.emailLog.count({ where }),
    prisma.emailLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        recipientEmail: true,
        subject: true,
        type: true,
        status: true,
        errorMessage: true,
        sentAt: true,
        createdAt: true,
        userId: true,
        // body hanya di detail
      },
    }),
  ])

  res.json({
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  })
})

router.get('/:id', requireAuth, async (req, res) => {
  const log = await prisma.emailLog.findUnique({ where: { id: req.params.id } })
  if (!log) return res.status(404).json({ error: 'Log tidak ditemukan' })

  const isAdmin = req.user!.role === 'admin'
  const owned =
    log.userId === req.user!.id || log.recipientEmail === req.user!.email.toLowerCase()
  if (!isAdmin && !owned) {
    return res.status(403).json({ error: 'Tidak diizinkan melihat log ini' })
  }

  res.json({ item: log })
})

export default router
