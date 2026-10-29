import { FormEvent, useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function ReferralPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  function show(type: 'ok' | 'err', text: string) {
    setToast({ type, text })
  }

  async function handleSend() {
    setSending(true)
    setToast(null)
    try {
      const data = await api<{ message: string; cooldownSec?: number }>('/api/referral/send', {
        method: 'POST',
        body: {},
      })
      show('ok', data.message)
      setCooldown(data.cooldownSec || 60)
    } catch (e) {
      show('err', e instanceof Error ? e.message : 'Gagal mengirim kode')
    } finally {
      setSending(false)
    }
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setToast(null)
    try {
      const data = await api<{ message: string }>('/api/referral/verify', {
        method: 'POST',
        body: { code },
      })
      show('ok', data.message)
      setCode('')
    } catch (err) {
      show('err', err instanceof Error ? err.message : 'Verifikasi gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page-panel">
      <div className="page-panel-head">
        <div className="eyebrow">PROMO</div>
        <h1>Kode Referral</h1>
        <p>
          Sistem mengirim kode unik ke emailmu. Masukkan kode di bawah sebelum kedaluwarsa (24 jam).
        </p>
      </div>

      {toast && (
        <div className={`login-alert ${toast.type === 'ok' ? 'success' : 'error'}`} role="status">
          {toast.text}
        </div>
      )}

      <div className="settings-grid">
        <article className="settings-card">
          <h3>1. Minta kode via email</h3>
          <p className="settings-desc">
            Kode 8 karakter dikirim ke email akun. Tombol kirim ulang memiliki jeda 60 detik.
          </p>
          <button
            type="button"
            className="primary-button settings-btn"
            disabled={sending || cooldown > 0}
            onClick={handleSend}
          >
            {sending ? 'Mengirim…' : cooldown > 0 ? `Kirim ulang (${cooldown}s)` : 'Kirim kode referral'}
          </button>
        </article>

        <article className="settings-card">
          <h3>2. Masukkan kode</h3>
          <form className="edit-form" onSubmit={handleVerify}>
            <label>
              Kode referral
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Contoh: A7K2M9QX"
                maxLength={16}
                required
                autoComplete="one-time-code"
              />
            </label>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Memverifikasi…' : 'Verifikasi kode'}
            </button>
          </form>
        </article>
      </div>
    </section>
  )
}
