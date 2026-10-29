import nodemailer from 'nodemailer'
import type { EmailType } from '@prisma/client'
import { prisma } from '../lib/prisma.js'

export type SendEmailInput = {
  to: string
  subject: string
  html: string
  /** Teks yang disimpan di log (boleh disensor) */
  bodyForLog: string
  type: EmailType
  userId?: string | null
}

/**
 * Service terpusat pengiriman email.
 * Setiap pengiriman dicatat ke email_logs: pending → sent | failed.
 */
export async function sendEmail(input: SendEmailInput) {
  const log = await prisma.emailLog.create({
    data: {
      userId: input.userId ?? null,
      recipientEmail: input.to.toLowerCase().trim(),
      subject: input.subject,
      body: input.bodyForLog,
      type: input.type,
      status: 'pending',
    },
  })

  try {
    const provider = (process.env.EMAIL_PROVIDER || 'smtp').toLowerCase()

    if (provider === 'resend') {
      await sendViaResend(input.to, input.subject, input.html)
    } else {
      await sendViaSmtp(input.to, input.subject, input.html)
    }

    const updated = await prisma.emailLog.update({
      where: { id: log.id },
      data: { status: 'sent', sentAt: new Date(), errorMessage: null },
    })
    return { ok: true as const, log: updated }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengirim email'
    const updated = await prisma.emailLog.update({
      where: { id: log.id },
      data: { status: 'failed', errorMessage: message },
    })
    return { ok: false as const, log: updated, error: message }
  }
}

async function sendViaSmtp(to: string, subject: string, html: string) {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) {
    // Mode pengembangan: anggap terkirim (log tetap tercatat)
    if (process.env.NODE_ENV !== 'production') {
      console.info('[email:dev] SMTP belum dikonfigurasi — simulasi kirim ke', to, subject)
      return
    }
    throw new Error('SMTP belum dikonfigurasi (SMTP_HOST/USER/PASS)')
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  })

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.MAIL_FROM || user,
    to,
    subject,
    html,
  })
}

async function sendViaResend(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[email:dev] RESEND_API_KEY belum ada — simulasi kirim ke', to)
      return
    }
    throw new Error('RESEND_API_KEY belum dikonfigurasi')
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || process.env.MAIL_FROM || 'Aksara <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Resend error: ${res.status} ${text}`)
  }
}
