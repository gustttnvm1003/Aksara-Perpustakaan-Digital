import { prisma } from '../lib/prisma.js'
import { generateNumericCode, hashSecret, verifySecret } from '../lib/crypto.js'
import { checkRateLimit } from '../lib/rateLimitStore.js'
import { sendEmail } from './emailService.js'
import {
  passwordChangedEmailHtml,
  resetPasswordEmailHtml,
} from '../templates/emailHtml.js'

const CODE_LEN = Number(process.env.RESET_CODE_LENGTH || 6)
const EXPIRES_MIN = Number(process.env.RESET_EXPIRES_MINUTES || 15)
const MAX_ATTEMPTS = Number(process.env.RESET_MAX_ATTEMPTS || 5)
const LOCK_MIN = Number(process.env.RESET_LOCK_MINUTES || 15)
const RATE_PER_HOUR = Number(process.env.RESET_RATE_LIMIT_PER_HOUR || 3)

const GENERIC_MSG = 'Jika email terdaftar, kode telah dikirim.'

export async function requestPasswordReset(email: string, ip: string) {
  const normalized = email.toLowerCase().trim()

  const rlEmail = await checkRateLimit(
    `email:${normalized}`,
    'reset_request',
    RATE_PER_HOUR,
    60 * 60 * 1000,
  )
  if (!rlEmail.allowed) {
    return {
      ok: true as const,
      message: GENERIC_MSG,
      // tetap generik; tidak bocorkan rate limit detail ke penyerang
    }
  }

  const rlIp = await checkRateLimit(`ip:${ip}`, 'reset_request', RATE_PER_HOUR, 60 * 60 * 1000)
  if (!rlIp.allowed) {
    return { ok: true as const, message: GENERIC_MSG }
  }

  const user = await prisma.user.findUnique({ where: { email: normalized } })
  // Selalu pesan generik
  if (!user) {
    return { ok: true as const, message: GENERIC_MSG }
  }

  const plainCode = generateNumericCode(CODE_LEN)
  const codeHash = await hashSecret(plainCode)
  const expiresAt = new Date(Date.now() + EXPIRES_MIN * 60 * 1000)

  await prisma.passwordResetCode.create({
    data: { userId: user.id, codeHash, expiresAt },
  })

  const html = resetPasswordEmailHtml(user.name, plainCode, EXPIRES_MIN)
  await sendEmail({
    to: user.email,
    subject: 'Kode Reset Password Aksara',
    html,
    // Keamanan: jangan simpan kode asli di body log
    bodyForLog: `Permintaan reset password untuk ${user.email}. Kode: [kode disembunyikan]. Berlaku ${EXPIRES_MIN} menit.`,
    type: 'reset_password',
    userId: user.id,
  })

  return { ok: true as const, message: GENERIC_MSG }
}

export async function confirmPasswordReset(input: {
  email: string
  code: string
  newPassword: string
}) {
  const normalized = input.email.toLowerCase().trim()
  const user = await prisma.user.findUnique({ where: { email: normalized } })
  if (!user) {
    return { ok: false as const, error: 'Kode tidak valid atau sudah kedaluwarsa.' }
  }

  const row = await prisma.passwordResetCode.findFirst({
    where: { userId: user.id, usedAt: null },
    orderBy: { createdAt: 'desc' },
  })

  if (!row) {
    return { ok: false as const, error: 'Kode tidak valid atau sudah kedaluwarsa.' }
  }

  if (row.lockedUntil && row.lockedUntil > new Date()) {
    return { ok: false as const, error: 'Terlalu banyak percobaan. Coba lagi nanti.' }
  }

  if (row.expiresAt < new Date()) {
    return { ok: false as const, error: 'Kode sudah kedaluwarsa. Minta kode baru.' }
  }

  const match = await verifySecret(input.code.trim(), row.codeHash)
  if (!match) {
    const attempts = row.attempts + 1
    await prisma.passwordResetCode.update({
      where: { id: row.id },
      data: {
        attempts,
        lockedUntil:
          attempts >= MAX_ATTEMPTS
            ? new Date(Date.now() + LOCK_MIN * 60 * 1000)
            : row.lockedUntil,
      },
    })
    return { ok: false as const, error: 'Kode tidak valid atau sudah kedaluwarsa.' }
  }

  const passwordHash = await hashSecret(input.newPassword)
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.passwordResetCode.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    }),
    // Hapus semua sesi aktif
    prisma.session.deleteMany({ where: { userId: user.id } }),
  ])

  const html = passwordChangedEmailHtml(user.name)
  await sendEmail({
    to: user.email,
    subject: 'Password Aksara Anda telah diubah',
    html,
    bodyForLog: `Notifikasi: password akun ${user.email} telah diubah.`,
    type: 'other',
    userId: user.id,
  })

  return { ok: true as const, message: 'Password berhasil diubah. Silakan masuk dengan password baru.' }
}
