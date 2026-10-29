import { FormEvent, useState } from 'react'
import { api } from '../lib/api'

type Props = {
  initialEmail?: string
  onBack: () => void
  onSuccess: () => void
}

export default function ResetPasswordApiPage({ initialEmail = '', onBack, onSuccess }: Props) {
  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.')
      return
    }
    if (newPassword.length < 8) {
      setError('Password minimal 8 karakter.')
      return
    }
    setLoading(true)
    try {
      const data = await api<{ message: string }>('/api/auth/reset', {
        method: 'POST',
        body: { email, code, newPassword, confirmPassword },
        auth: false,
      })
      setMessage(data.message)
      setTimeout(onSuccess, 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-card">
      <button type="button" className="auth-back" onClick={onBack}>
        ← Kembali
      </button>
      <div className="login-card-head">
        <h2>Reset password</h2>
        <p>Masukkan email, kode 6 digit dari email, dan password baru.</p>
      </div>
      {message && (
        <div className="login-alert success" role="status">
          {message}
        </div>
      )}
      {error && (
        <div className="login-alert error" role="alert">
          {error}
        </div>
      )}
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="rp-email">Email</label>
          <div className="field-control">
            <input
              id="rp-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="rp-code">Kode verifikasi</label>
          <div className="field-control">
            <input
              id="rp-code"
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6 digit"
              maxLength={12}
              required
              disabled={loading}
              autoComplete="one-time-code"
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="rp-new">Password baru</label>
          <div className="field-control">
            <input
              id="rp-new"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
              disabled={loading}
              autoComplete="new-password"
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="rp-confirm">Konfirmasi password</label>
          <div className="field-control">
            <input
              id="rp-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
              disabled={loading}
              autoComplete="new-password"
            />
          </div>
        </div>
        <button type="submit" className="login-submit" disabled={loading}>
          {loading ? 'Menyimpan…' : 'Simpan password baru'}
        </button>
      </form>
    </div>
  )
}
