import { prisma } from '../lib/prisma.js'
import { generateAlphanumericCode } from '../lib/crypto.js'
import { sendEmail } from './emailService.js'
import { referralEmailHtml } from '../templates/emailHtml.js'

const CODE_LEN = Number(process.env.REFERRAL_CODE_LENGTH || 8)
const EXPIRES_H = Number(process.env.REFERRAL_EXPIRES_HOURS || 24)
const MAX_ATTEMPTS = Number(process.env.REFERRAL_MAX_ATTEMPTS || 5)
const LOCK_MIN = Number(process.env.REFERRAL_LOCK_MINUTES || 15)
const RESEND_COOLDOWN = Number(process.env.REFERRAL_RESEND_COOLDOWN_SEC || 60)

/** Reward referral — mudah diubah */
export async function applyReferralReward(userId: string): Promise<{ message: string }> {
  // Contoh benefit: flag di masa depan / poin. Untuk sekarang pesan sukses saja.
  await prisma.user.update({
    where: { id: userId },
    data: { updatedAt: new Date() },
  })
  return {
    message: 'Kode referral berhasil. Benefit: akses koleksi unggulan selama 30 hari (simulasi).',
  }
}

export async function sendReferralCode(userId: string, email: string, name: string) {
  const last = await prisma.referralCode.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
  if (last) {
    const elapsed = (Date.now() - last.createdAt.getTime()) / 1000
    if (elapsed < RESEND_COOLDOWN) {
      const wait = Math.ceil(RESEND_COOLDOWN - elapsed)
      return { ok: false as const, error: `Tunggu ${wait} detik sebelum kirim ulang kode.` }
    }
  }

  const code = generateAlphanumericCode(CODE_LEN)
  const expiresAt = new Date(Date.now() + EXPIRES_H * 60 * 60 * 1000)

  await prisma.referralCode.create({
    data: { code, userId, email: email.toLowerCase(), expiresAt },
  })

  const html = referralEmailHtml(name, code, EXPIRES_H)
  const result = await sendEmail({
    to: email,
    subject: 'Kode Referral Aksara',
    html,
    bodyForLog: `Kode referral dikirim ke ${email} (kode disembunyikan di log untuk privasi operasional; tipe=referral).`,
    type: 'referral',
    userId,
  })

  if (!result.ok) {
    return { ok: false as const, error: result.error || 'Gagal mengirim email referral.' }
  }
  return { ok: true as const, expiresAt, cooldownSec: RESEND_COOLDOWN }
}

export async function verifyReferralCode(userId: string, email: string, code: string) {
  const normalized = code.trim().toUpperCase()
  const row = await prisma.referralCode.findFirst({
    where: { userId, email: email.toLowerCase() },
    orderBy: { createdAt: 'desc' },
  })

  if (!row) {
    return { ok: false as const, error: 'Belum ada kode referral. Silakan kirim kode terlebih dahulu.' }
  }

  if (row.lockedUntil && row.lockedUntil > new Date()) {
    const m = Math.ceil((row.lockedUntil.getTime() - Date.now()) / 60000)
    return { ok: false as const, error: `Terlalu banyak percobaan. Coba lagi dalam ${m} menit.` }
  }

  if (row.usedAt) {
    return { ok: false as const, error: 'Kode ini sudah pernah dipakai.' }
  }

  if (row.expiresAt < new Date()) {
    return { ok: false as const, error: 'Kode sudah kedaluwarsa. Kirim ulang kode baru.' }
  }

  if (row.code !== normalized) {
    const attempts = row.attempts + 1
    const data: { attempts: number; lockedUntil?: Date } = { attempts }
    if (attempts >= MAX_ATTEMPTS) {
      data.lockedUntil = new Date(Date.now() + LOCK_MIN * 60 * 1000)
    }
    await prisma.referralCode.update({ where: { id: row.id }, data })
    const left = Math.max(0, MAX_ATTEMPTS - attempts)
    return {
      ok: false as const,
      error:
        left > 0
          ? `Kode tidak valid. Sisa percobaan: ${left}.`
          : `Kode salah berulang kali. Terkunci ${LOCK_MIN} menit.`,
    }
  }

  await prisma.referralCode.update({
    where: { id: row.id },
    data: { usedAt: new Date() },
  })

  const reward = await applyReferralReward(userId)
  return { ok: true as const, reward }
}
