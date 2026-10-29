import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import emailHistoryRoutes from './routes/emailHistory.js'
import referralRoutes from './routes/referral.js'
import passwordResetRoutes from './routes/passwordReset.js'

const app = express()
const port = Number(process.env.PORT || 4000)

app.set('trust proxy', process.env.TRUST_PROXY === '1' || process.env.TRUST_PROXY === 'true' ? 1 : false)
app.use(helmet())
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || true,
    credentials: true,
  }),
)
app.use(express.json({ limit: '100kb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'aksara-server' })
})

app.use('/api/email-history', emailHistoryRoutes)
app.use('/api/referral', referralRoutes)
app.use('/api/auth', passwordResetRoutes)

// CSRF note: API Bearer-token (bukan cookie session browser) — proteksi utama JWT + rate limit.
// Jika nanti memakai cookie session, tambahkan csurf / double-submit token.

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Terjadi kesalahan server.' })
})

app.listen(port, () => {
  console.log(`Aksara API listening on http://localhost:${port}`)
})
