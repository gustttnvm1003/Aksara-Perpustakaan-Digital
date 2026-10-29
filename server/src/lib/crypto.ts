import { randomBytes, randomInt, createHash } from 'node:crypto'
import bcrypt from 'bcryptjs'

/** Kode alfanumerik aman (bukan Math.random) */
export function generateAlphanumericCode(length = 8): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // tanpa karakter ambigu
  const bytes = randomBytes(length)
  let out = ''
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i]! % alphabet.length]
  }
  return out
}

/** Kode numerik 6 digit aman */
export function generateNumericCode(length = 6): string {
  const max = 10 ** length
  const n = randomInt(0, max)
  return n.toString().padStart(length, '0')
}

export async function hashSecret(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12)
}

export async function verifySecret(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}
