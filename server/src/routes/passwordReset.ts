import { Router } from 'express'
import { z } from 'zod'
import rateLimit from 'express-rate-limit'
import { requestPasswordReset, confirmPasswordReset } from '../services/passwordResetService.js'

const router = Router()

const ipLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak permintaan dari IP ini.' },
})

const forgotSchema = z.object({
  email: z.string().email('Format email tidak valid').max(200),
})

router.post('/forgot', ipLimiter, async (req, res) => {
  const parsed = forgotSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Email tidak valid.' })
  }
  const ip = req.ip || req.socket.remoteAddress || 'unknown'
  const result = await requestPasswordReset(parsed.data.email, ip)
  // Selalu 200 dengan pesan generik
  res.json({ message: result.message })
})

const resetSchema = z
  .object({
    email: z.string().email().max(200),
    code: z.string().min(4).max(12),
    newPassword: z.string().min(8, 'Password minimal 8 karakter').max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Konfirmasi password tidak cocok.',
    path: ['confirmPassword'],
  })

router.post('/reset', ipLimiter, async (req, res) => {
  const parsed = resetSchema.safeParse(req.body)
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message || 'Data tidak valid.'
    return res.status(400).json({ error: msg })
  }
  const result = await confirmPasswordReset({
    email: parsed.data.email,
    code: parsed.data.code,
    newPassword: parsed.data.newPassword,
  })
  if (!result.ok) return res.status(400).json({ error: result.error })
  res.json({ message: result.message })
})

export default router
