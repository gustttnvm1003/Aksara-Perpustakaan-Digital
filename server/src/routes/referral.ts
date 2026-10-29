import { Router } from 'express'
import { z } from 'zod'
import rateLimit from 'express-rate-limit'
import { requireAuth } from '../middleware/auth.js'
import { sendReferralCode, verifyReferralCode } from '../services/referralService.js'

const router = Router()

const sendLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak permintaan. Coba lagi sebentar.' },
})

router.post('/send', requireAuth, sendLimiter, async (req, res) => {
  const result = await sendReferralCode(req.user!.id, req.user!.email, req.user!.name)
  if (!result.ok) return res.status(429).json({ error: result.error })
  res.json({
    message: 'Jika proses berhasil, kode referral telah dikirim ke email akunmu.',
    expiresAt: result.expiresAt,
    cooldownSec: result.cooldownSec,
  })
})

const verifySchema = z.object({
  code: z
    .string()
    .min(4)
    .max(16)
    .transform((s) => s.trim().toUpperCase()),
})

router.post('/verify', requireAuth, async (req, res) => {
  const parsed = verifySchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Kode referral tidak valid.' })
  }
  const result = await verifyReferralCode(req.user!.id, req.user!.email, parsed.data.code)
  if (!result.ok) return res.status(400).json({ error: result.error })
  res.json({ message: result.reward.message })
})

export default router
