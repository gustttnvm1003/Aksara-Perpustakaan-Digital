import { useCallback, useEffect, useState } from 'react'
import { api, type EmailLogItem } from '../lib/api'

type Props = { isAdmin: boolean }

export default function EmailHistoryPage({ isAdmin }: Props) {
  const [items, setItems] = useState<EmailLogItem[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [detail, setDetail] = useState<EmailLogItem | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' })
      if (type) params.set('type', type)
      if (status) params.set('status', status)
      if (q.trim()) params.set('q', q.trim())
      const data = await api<{
        items: EmailLogItem[]
        pagination: { totalPages: number }
      }>(`/api/email-history?${params}`)
      setItems(data.items)
      setTotalPages(data.pagination.totalPages)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat riwayat')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [page, type, status, q])

  useEffect(() => {
    void load()
  }, [load])

  async function openDetail(id: string) {
    try {
      const data = await api<{ item: EmailLogItem }>(`/api/email-history/${id}`)
      setDetail(data.item)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat detail')
    }
  }

  return (
    <section className="page-panel">
      <div className="page-panel-head">
        <div className="eyebrow">SISTEM</div>
        <h1>Riwayat Email</h1>
        <p>
          {isAdmin
            ? 'Semua email yang dikirim sistem (permanen di database).'
            : 'Riwayat email yang terkait akunmu.'}
        </p>
      </div>

      <div className="filter-bar">
        <input
          type="search"
          placeholder="Cari email atau subjek…"
          value={q}
          onChange={(e) => {
            setPage(1)
            setQ(e.target.value)
          }}
        />
        <select
          value={type}
          onChange={(e) => {
            setPage(1)
            setType(e.target.value)
          }}
        >
          <option value="">Semua tipe</option>
          <option value="referral">Referral</option>
          <option value="reset_password">Reset password</option>
          <option value="verification">Verifikasi</option>
          <option value="other">Lainnya</option>
        </select>
        <select
          value={status}
          onChange={(e) => {
            setPage(1)
            setStatus(e.target.value)
          }}
        >
          <option value="">Semua status</option>
          <option value="pending">Pending</option>
          <option value="sent">Terkirim</option>
          <option value="failed">Gagal</option>
        </select>
      </div>

      {error && (
        <div className="login-alert error" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p className="empty">Memuat riwayat…</p>
      ) : items.length === 0 ? (
        <div className="empty">Belum ada riwayat email.</div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Penerima</th>
                <th>Subjek</th>
                <th>Tipe</th>
                <th>Status</th>
                <th>Waktu</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id}>
                  <td>{row.recipientEmail}</td>
                  <td>{row.subject}</td>
                  <td>
                    <span className="pill">{row.type}</span>
                  </td>
                  <td>
                    <span className={`pill status-${row.status}`}>{row.status}</span>
                  </td>
                  <td>{new Date(row.createdAt).toLocaleString('id-ID')}</td>
                  <td>
                    <button type="button" className="link-btn primary-link" onClick={() => openDetail(row.id)}>
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pager">
        <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Sebelumnya
        </button>
        <span>
          Halaman {page} / {totalPages}
        </span>
        <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
          Berikutnya
        </button>
      </div>

      {detail && (
        <div className="modal-backdrop anim-backdrop" onClick={() => setDetail(null)}>
          <section className="modal anim-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setDetail(null)}>
              ×
            </button>
            <span className="eyebrow">DETAIL EMAIL</span>
            <h2>{detail.subject}</h2>
            <p className="modal-sub">
              Ke: {detail.recipientEmail} · {detail.type} · {detail.status}
            </p>
            <div className="synopsis-block">
              <h4>Isi (log)</h4>
              <p style={{ whiteSpace: 'pre-wrap' }}>{detail.body}</p>
            </div>
            {detail.errorMessage && (
              <p className="edit-msg error">Error: {detail.errorMessage}</p>
            )}
          </section>
        </div>
      )}
    </section>
  )
}
