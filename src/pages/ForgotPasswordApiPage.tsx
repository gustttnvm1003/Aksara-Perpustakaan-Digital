import { FormEvent, useState } from 'react'
import { api } from '../lib/api'

type Props = {
  onBack: () => void
  onGoReset: (email: string) => void
}

/** Lupa password yang memanggil API server (kode via email) */
export default function ForgotPasswordApiPage({ onBack, onGoReset }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const data = await api<{ message: string }>('/api/auth/forgot', {
        method: 'POST',
        body: { email },
        auth: false,
      })
      setMessage(data.message)
      // Arahkan ke form reset (kode + password baru)
      setTimeout(() => onGoReset(email), 800)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memproses permintaan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-card">
      <button type="button" className="auth-back" onClick={onBack}>
        ← Kembali ke masuk
      </button>
      <div className="login-card-head">
        <h2>Lupa password?</h2>
        <p>Masukkan email akun. Jika terdaftar, kode 6 digit akan dikirim ke email tersebut.</p>
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
          <label htmlFor="fp-api-email">Email</label>
          <div className="field-control">
            <input
              id="fp-api-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
              disabled={loading}
            />
          </div>
        </div>
        <button type="submit" className="login-submit" disabled={loading}>
          {loading ? 'Mengirim…' : 'Kirim kode reset'}
        </button>
      </form>
    </div>
  )
}
