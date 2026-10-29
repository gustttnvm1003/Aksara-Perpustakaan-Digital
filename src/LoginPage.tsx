import { useState, useEffect, FormEvent, ChangeEvent } from 'react'

/* Ikon sederhana agar konsisten dengan App.tsx */
function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    book: (
      <>
        <path d="M12 5c-4-3-9-2-9-2v16s5-1 9 2c4-3 9-2 9-2V3s-5-1-9 2Z" />
        <path d="M12 5v16" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    eyeOff: (
      <>
        <path d="M3 3l18 18" />
        <path d="M10.5 10.5a2.5 2.5 0 0 0 3 3" />
        <path d="M7 7.2C4.6 8.6 3 12 3 12s3.5 7 9 7a9.7 9.7 0 0 0 4.2-1" />
        <path d="M14.5 9.2A9.7 9.7 0 0 1 21 12s-1.2 2.4-3.2 4.2" />
      </>
    ),
    check: <path d="M5 12.5 9.5 17 19 7" />,
    alert: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5m0 3h.01" />
      </>
    ),
    spinner: <path d="M12 3a9 9 0 1 1-9 9" />,
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 7 9-7" />
      </>
    ),
    arrowLeft: <path d="M19 12H5m6 6-6-6 6-6" />,
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.book}
    </svg>
  )
}

/** Data pengguna setelah login berhasil */
export type LoginUser = {
  name: string
  email: string
  role: 'anggota' | 'pustakawan' | 'admin'
  initials: string
  /** Data URL foto profil (opsional) */
  avatar?: string
}

type LoginPageProps = {
  onSuccess: (user: LoginUser) => void
}

type AuthView = 'login' | 'register' | 'forgot'

type StoredAccount = {
  identifier: string[]
  password: string
  user: LoginUser
  status: 'aktif' | 'nonaktif' | 'diblokir'
}

const STORAGE_KEY = 'aksara_registered_accounts'

const DEMO_ACCOUNTS: StoredAccount[] = [
  {
    identifier: ['aditya@aksara.id', '23115001', 'aditya'],
    password: 'Aksara123',
    user: {
      name: 'Aditya Pratama',
      email: 'aditya@aksara.id',
      role: 'anggota',
      initials: 'AP',
    },
    status: 'aktif',
  },
  {
    identifier: ['pustakawan@aksara.id', 'pustakawan'],
    password: 'Aksara123',
    user: {
      name: 'Sari Wulandari',
      email: 'pustakawan@aksara.id',
      role: 'pustakawan',
      initials: 'SW',
    },
    status: 'aktif',
  },
  {
    identifier: ['admin@aksara.id', 'admin'],
    password: 'Aksara123',
    user: {
      name: 'Budi Santoso',
      email: 'admin@aksara.id',
      role: 'admin',
      initials: 'BS',
    },
    status: 'aktif',
  },
]

function sanitize(value: string): string {
  return value.replace(/[<>"'`]/g, '').trim()
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isValidIdentifier(value: string): boolean {
  if (!value) return false
  if (value.includes('@')) return isValidEmail(value)
  return /^(?:\d{6,}|[a-zA-Z][a-zA-Z0-9._]{2,})$/.test(value)
}

function makeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function loadRegistered(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StoredAccount[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveRegistered(list: StoredAccount[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    /* abaikan */
  }
}

function allAccounts(): StoredAccount[] {
  // Akun terdaftar / override password didahulukan dari akun demo
  return [...loadRegistered(), ...DEMO_ACCOUNTS]
}

function findAccount(id: string): StoredAccount | undefined {
  const key = id.toLowerCase()
  // Cari dulu di registered (termasuk override password demo), lalu demo
  const registered = loadRegistered()
  const fromReg = registered.find((a) => a.identifier.some((x) => x.toLowerCase() === key))
  if (fromReg) return fromReg
  return DEMO_ACCOUNTS.find((a) => a.identifier.some((x) => x.toLowerCase() === key))
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** OTP 6 digit (demo; produksi dikirim via email/SMS) */
function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

/** Panel branding kiri — dipakai semua tampilan auth */
function BrandPanel() {
  return (
    <aside className="login-brand">
      <div className="login-brand-inner">
        <a className="brand login-logo" href="#" onClick={(e) => e.preventDefault()}>
          <span className="brand-icon">
            <Icon name="book" size={24} />
          </span>
          aksara
          <span className="brand-dot">.</span>
        </a>
        <p className="login-tagline">RUANG BACA DIGITALMU</p>
        <h1 className="login-headline">
          Buka buku.
          <br />
          Buka <em>dunia baru.</em>
        </h1>
        <p className="login-desc">
          Masuk untuk menjelajahi ribuan buku digital, menyimpan koleksi pribadi, dan
          melanjutkan bacaanmu di mana saja.
        </p>
        <ul className="login-points">
          <li>
            <Icon name="check" size={16} /> Katalog 10.000+ buku digital
          </li>
          <li>
            <Icon name="check" size={16} /> Koleksi & riwayat bacaan tersimpan
          </li>
          <li>
            <Icon name="check" size={16} /> Akses anggota, pustakawan, dan admin
          </li>
        </ul>
      </div>
    </aside>
  )
}

export default function LoginPage({ onSuccess }: LoginPageProps) {
  const [view, setView] = useState<AuthView>('login')

  // ── Login state ──────────────────────────────────────────
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'auto' | 'anggota' | 'pustakawan' | 'admin'>('auto')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'idle' | 'validating' | 'sending' | 'verifying' | 'done'>('idle')
  const [successMsg, setSuccessMsg] = useState('')
  const [failCount, setFailCount] = useState(0)

  // ── OTP (login / daftar / lupa password) ─────────────────
  const [loginPhase, setLoginPhase] = useState<'credentials' | 'otp'>('credentials')
  const [loginOtp, setLoginOtp] = useState('')
  const [loginOtpExpected, setLoginOtpExpected] = useState('')
  const [pendingUser, setPendingUser] = useState<LoginUser | null>(null)
  const [otpCooldown, setOtpCooldown] = useState(0)
  const [otpAttempts, setOtpAttempts] = useState(0)

  const [regPhase, setRegPhase] = useState<'form' | 'otp'>('form')
  const [regOtp, setRegOtp] = useState('')
  const [regOtpExpected, setRegOtpExpected] = useState('')
  const [pendingReg, setPendingReg] = useState<StoredAccount | null>(null)

  const [fpStep, setFpStep] = useState<'email' | 'otp' | 'reset' | 'done'>('email')
  const [fpOtp, setFpOtp] = useState('')
  const [fpOtpExpected, setFpOtpExpected] = useState('')

  // ── Register state ───────────────────────────────────────
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regUsername, setRegUsername] = useState('')
  const [regNim, setRegNim] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [regRole, setRegRole] = useState<'anggota' | 'pustakawan'>('anggota')
  const [showRegPw, setShowRegPw] = useState(false)
  const [showRegConfirm, setShowRegConfirm] = useState(false)
  const [regErrors, setRegErrors] = useState<Record<string, string>>({})
  const [regLoading, setRegLoading] = useState(false)
  const [regSuccess, setRegSuccess] = useState('')

  // ── Forgot password state ────────────────────────────────
  const [fpEmail, setFpEmail] = useState('')
  const [fpNewPassword, setFpNewPassword] = useState('')
  const [fpConfirm, setFpConfirm] = useState('')
  const [showFpPw, setShowFpPw] = useState(false)
  const [fpErrors, setFpErrors] = useState<Record<string, string>>({})
  const [fpLoading, setFpLoading] = useState(false)
  const [fpSuccess, setFpSuccess] = useState('')
  const [fpFoundEmail, setFpFoundEmail] = useState('')

  useEffect(() => {
    try {
      const remembered = localStorage.getItem('aksara_remember')
      if (remembered) {
        setIdentifier(remembered)
        setRemember(true)
      }
    } catch {
      /* abaikan */
    }
  }, [])

  function goTo(next: AuthView) {
    setView(next)
    setErrors({})
    setSuccessMsg('')
    setRegErrors({})
    setRegSuccess('')
    setFpErrors({})
    setFpSuccess('')
    setFpStep('email')
    setStep('idle')
    setLoading(false)
    setRegLoading(false)
    setFpLoading(false)
    setLoginPhase('credentials')
    setLoginOtp('')
    setLoginOtpExpected('')
    setPendingUser(null)
    setOtpAttempts(0)
    setOtpCooldown(0)
    setRegPhase('form')
    setRegOtp('')
    setRegOtpExpected('')
    setPendingReg(null)
    setFpOtp('')
    setFpOtpExpected('')
  }

  // Cooldown kirim ulang OTP
  useEffect(() => {
    if (otpCooldown <= 0) return
    const t = setTimeout(() => setOtpCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [otpCooldown])

  // ── LOGIN ────────────────────────────────────────────────
  function validateLogin(): Record<string, string> {
    const next: Record<string, string> = {}
    const id = sanitize(identifier)
    if (!id) next.identifier = 'Email / NIM / Username wajib diisi.'
    else if (!isValidIdentifier(id)) next.identifier = 'Format email, NIM, atau username tidak valid.'
    if (!password) next.password = 'Password wajib diisi.'
    else if (password.length < 8) next.password = 'Password minimal 8 karakter.'
    return next
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setSuccessMsg('')
    setErrors({})
    setStep('validating')
    const fieldErrors = validateLogin()
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      setStep('idle')
      return
    }

    setLoading(true)
    setStep('sending')
    const cleanId = sanitize(identifier).toLowerCase()
    await wait(600)
    setStep('verifying')
    await wait(400)

    const account = findAccount(cleanId)

    if (!account || account.password !== password) {
      const nextFail = failCount + 1
      setFailCount(nextFail)
      const remaining = Math.max(0, 5 - nextFail)
      setErrors({
        form:
          remaining > 0
            ? `Email/NIM atau password salah. Sisa percobaan: ${remaining}.`
            : 'Terlalu banyak percobaan gagal. Akun dikunci sementara 15 menit.',
      })
      setLoading(false)
      setStep('idle')
      return
    }

    if (account.status === 'nonaktif') {
      setErrors({ form: 'Akun belum aktif. Hubungi pustakawan untuk aktivasi.' })
      setLoading(false)
      setStep('idle')
      return
    }
    if (account.status === 'diblokir') {
      setErrors({ form: 'Akun diblokir. Hubungi admin perpustakaan.' })
      setLoading(false)
      setStep('idle')
      return
    }
    if (role !== 'auto' && role !== account.user.role) {
      setErrors({
        form: 'Peran yang dipilih tidak sesuai dengan akun. Gunakan "Deteksi otomatis".',
      })
      setLoading(false)
      setStep('idle')
      return
    }

    // Password benar → minta OTP
    const otp = generateOtp()
    setLoginOtpExpected(otp)
    setPendingUser(account.user)
    setLoginPhase('otp')
    setLoginOtp('')
    setOtpAttempts(0)
    setOtpCooldown(60)
    setFailCount(0)
    setLoading(false)
    setStep('idle')
    setSuccessMsg(
      `Kode OTP telah dikirim ke email terdaftar. (Demo: gunakan kode ${otp})`,
    )
  }

  async function handleVerifyLoginOtp(e: FormEvent) {
    e.preventDefault()
    setErrors({})
    if (!loginOtp.trim() || loginOtp.trim().length < 6) {
      setErrors({ form: 'Masukkan kode OTP 6 digit.' })
      return
    }
    if (otpAttempts >= 5) {
      setErrors({ form: 'Terlalu banyak percobaan OTP. Minta kode baru.' })
      return
    }
    setLoading(true)
    await wait(400)
    if (loginOtp.trim() !== loginOtpExpected) {
      const next = otpAttempts + 1
      setOtpAttempts(next)
      setErrors({
        form: `Kode OTP salah. Sisa percobaan: ${Math.max(0, 5 - next)}.`,
      })
      setLoading(false)
      return
    }
    if (!pendingUser) {
      setErrors({ form: 'Sesi OTP tidak valid. Silakan login ulang.' })
      setLoading(false)
      setLoginPhase('credentials')
      return
    }
    if (remember) {
      try {
        localStorage.setItem('aksara_remember', pendingUser.email)
      } catch {
        /* abaikan */
      }
    } else {
      try {
        localStorage.removeItem('aksara_remember')
      } catch {
        /* abaikan */
      }
    }
    setSuccessMsg(`Login berhasil. Selamat datang, ${pendingUser.name}!`)
    setStep('done')
    await wait(600)
    onSuccess(pendingUser)
  }

  function resendLoginOtp() {
    if (otpCooldown > 0 || !pendingUser) return
    const otp = generateOtp()
    setLoginOtpExpected(otp)
    setLoginOtp('')
    setOtpAttempts(0)
    setOtpCooldown(60)
    setErrors({})
    setSuccessMsg(`Kode OTP baru dikirim. (Demo: ${otp})`)
  }

  // ── REGISTER ─────────────────────────────────────────────
  function validateRegister(): Record<string, string> {
    const next: Record<string, string> = {}
    const name = sanitize(regName)
    const email = sanitize(regEmail).toLowerCase()
    const username = sanitize(regUsername).toLowerCase()
    const nim = sanitize(regNim)

    if (!name || name.length < 3) next.name = 'Nama lengkap minimal 3 karakter.'
    if (!email) next.email = 'Email wajib diisi.'
    else if (!isValidEmail(email)) next.email = 'Format email tidak valid.'
    if (!username) next.username = 'Username wajib diisi.'
    else if (!/^[a-zA-Z][a-zA-Z0-9._]{2,}$/.test(username))
      next.username = 'Username minimal 3 karakter, mulai dengan huruf.'
    if (nim && !/^\d{6,}$/.test(nim)) next.nim = 'NIM harus angka minimal 6 digit (opsional).'
    if (!regPassword) next.password = 'Password wajib diisi.'
    else if (regPassword.length < 8) next.password = 'Password minimal 8 karakter.'
    if (regPassword !== regConfirm) next.confirm = 'Konfirmasi password tidak cocok.'

    if (email && findAccount(email)) next.email = 'Email sudah terdaftar. Silakan masuk.'
    if (username && findAccount(username)) next.username = 'Username sudah dipakai.'
    if (nim && findAccount(nim)) next.nim = 'NIM sudah terdaftar.'

    return next
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault()
    setRegSuccess('')
    setRegErrors({})
    const fieldErrors = validateRegister()
    if (Object.keys(fieldErrors).length > 0) {
      setRegErrors(fieldErrors)
      return
    }

    setRegLoading(true)
    await wait(800)

    const name = sanitize(regName)
    const email = sanitize(regEmail).toLowerCase()
    const username = sanitize(regUsername).toLowerCase()
    const nim = sanitize(regNim)

    const identifiers = [email, username]
    if (nim) identifiers.push(nim)

    const account: StoredAccount = {
      identifier: identifiers,
      password: regPassword,
      user: {
        name,
        email,
        role: regRole,
        initials: makeInitials(name),
      },
      status: 'aktif',
    }

    const otp = generateOtp()
    setPendingReg(account)
    setRegOtpExpected(otp)
    setRegPhase('otp')
    setRegOtp('')
    setOtpCooldown(60)
    setRegLoading(false)
    setRegSuccess(
      `Kode OTP verifikasi telah dikirim ke ${email}. (Demo: gunakan kode ${otp})`,
    )
  }

  async function handleVerifyRegOtp(e: FormEvent) {
    e.preventDefault()
    setRegErrors({})
    if (!regOtp.trim() || regOtp.trim().length < 6) {
      setRegErrors({ form: 'Masukkan kode OTP 6 digit.' })
      return
    }
    setRegLoading(true)
    await wait(400)
    if (regOtp.trim() !== regOtpExpected) {
      setRegErrors({ form: 'Kode OTP salah. Periksa email atau minta kirim ulang.' })
      setRegLoading(false)
      return
    }
    if (!pendingReg) {
      setRegErrors({ form: 'Sesi pendaftaran tidak valid.' })
      setRegLoading(false)
      return
    }
    const list = loadRegistered()
    list.push(pendingReg)
    saveRegistered(list)
    setRegLoading(false)
    setRegSuccess('Akun berhasil diverifikasi dan dibuat! Silakan masuk.')
    await wait(900)
    setIdentifier(pendingReg.user.email)
    setPassword('')
    goTo('login')
    setSuccessMsg('Pendaftaran berhasil. Silakan masuk.')
  }

  function resendRegOtp() {
    if (otpCooldown > 0 || !pendingReg) return
    const otp = generateOtp()
    setRegOtpExpected(otp)
    setRegOtp('')
    setOtpCooldown(60)
    setRegErrors({})
    setRegSuccess(`Kode OTP baru dikirim ke ${pendingReg.user.email}. (Demo: ${otp})`)
  }

  // ── FORGOT PASSWORD ──────────────────────────────────────
  async function handleForgotCheck(e: FormEvent) {
    e.preventDefault()
    setFpErrors({})
    setFpSuccess('')
    const email = sanitize(fpEmail).toLowerCase()
    if (!email) {
      setFpErrors({ email: 'Email / username wajib diisi.' })
      return
    }
    if (!isValidIdentifier(email)) {
      setFpErrors({ email: 'Format email atau username tidak valid.' })
      return
    }

    setFpLoading(true)
    await wait(700)
    const account = findAccount(email)
    setFpLoading(false)

    // Pesan generik agar tidak bocorkan apakah email ada
    if (!account) {
      setFpErrors({
        form: 'Jika akun terdaftar, kamu bisa mengatur password baru. Periksa kembali email/username.',
      })
      return
    }

    setFpFoundEmail(account.user.email)
    const otp = generateOtp()
    setFpOtpExpected(otp)
    setFpOtp('')
    setFpStep('otp')
    setOtpCooldown(60)
    setFpSuccess(
      `Kode OTP dikirim ke ${account.user.email}. (Demo: ${otp}). Masukkan kode untuk lanjut reset password.`,
    )
  }

  async function handleVerifyFpOtp(e: FormEvent) {
    e.preventDefault()
    setFpErrors({})
    if (!fpOtp.trim() || fpOtp.trim().length < 6) {
      setFpErrors({ form: 'Masukkan kode OTP 6 digit.' })
      return
    }
    setFpLoading(true)
    await wait(400)
    if (fpOtp.trim() !== fpOtpExpected) {
      setFpErrors({ form: 'Kode OTP salah.' })
      setFpLoading(false)
      return
    }
    setFpLoading(false)
    setFpStep('reset')
    setFpSuccess('OTP benar. Silakan buat password baru.')
  }

  function resendFpOtp() {
    if (otpCooldown > 0 || !fpFoundEmail) return
    const otp = generateOtp()
    setFpOtpExpected(otp)
    setFpOtp('')
    setOtpCooldown(60)
    setFpErrors({})
    setFpSuccess(`Kode OTP baru dikirim. (Demo: ${otp})`)
  }

  async function handleForgotReset(e: FormEvent) {
    e.preventDefault()
    setFpErrors({})
    if (!fpNewPassword || fpNewPassword.length < 8) {
      setFpErrors({ password: 'Password baru minimal 8 karakter.' })
      return
    }
    if (fpNewPassword !== fpConfirm) {
      setFpErrors({ confirm: 'Konfirmasi password tidak cocok.' })
      return
    }

    setFpLoading(true)
    await wait(700)

    const key = fpFoundEmail.toLowerCase()
    const registered = loadRegistered()
    const idx = registered.findIndex((a) =>
      a.identifier.some((id) => id.toLowerCase() === key),
    )

    if (idx >= 0) {
      registered[idx] = { ...registered[idx], password: fpNewPassword }
      saveRegistered(registered)
    } else {
      // Overlay password untuk akun demo (disimpan terpisah)
      const demo = DEMO_ACCOUNTS.find((a) =>
        a.identifier.some((id) => id.toLowerCase() === key),
      )
      if (demo) {
        const overlay: StoredAccount = {
          ...demo,
          password: fpNewPassword,
        }
        // Simpan sebagai override: cari & ganti di registered dengan identifier email demo
        const filtered = registered.filter(
          (a) => !a.identifier.some((id) => id.toLowerCase() === key),
        )
        filtered.push(overlay)
        saveRegistered(filtered)
      }
    }

    setFpLoading(false)
    setFpStep('done')
    setFpSuccess('Password berhasil diubah. Silakan masuk dengan password baru.')
    await wait(1000)
    setIdentifier(fpFoundEmail)
    setPassword('')
    goTo('login')
    setSuccessMsg('Password berhasil diubah. Silakan masuk.')
  }

  // ── RENDER ───────────────────────────────────────────────
  return (
    <div className="login-shell">
      <BrandPanel />

      <main className="login-main">
        <div className="login-card">
          {/* ========== LOGIN ========== */}
          {view === 'login' && (
            <>
              <div className="login-card-head">
                <h2>{loginPhase === 'otp' ? 'Verifikasi OTP' : 'Masuk ke Aksara'}</h2>
                <p>
                  {loginPhase === 'otp'
                    ? 'Masukkan kode OTP 6 digit yang dikirim ke email akunmu.'
                    : 'Gunakan email, NIM, atau username anggota perpustakaan.'}
                </p>
              </div>

              {successMsg && (
                <div className="login-alert success" role="status">
                  <Icon name="check" size={18} />
                  <span>{successMsg}</span>
                </div>
              )}
              {errors.form && (
                <div className="login-alert error" role="alert">
                  <Icon name="alert" size={18} />
                  <span>{errors.form}</span>
                </div>
              )}

              {loginPhase === 'credentials' && (
              <form className="login-form" onSubmit={handleLogin} noValidate>
                <div className="field">
                  <label htmlFor="identifier">Email / NIM / Username</label>
                  <div className={`field-control ${errors.identifier ? 'has-error' : ''}`}>
                    <span className="field-icon">
                      <Icon name="user" size={18} />
                    </span>
                    <input
                      id="identifier"
                      type="text"
                      autoComplete="username"
                      placeholder="contoh: aditya@aksara.id"
                      value={identifier}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setIdentifier(e.target.value)
                        if (errors.identifier)
                          setErrors((p) => ({ ...p, identifier: '', form: '' }))
                      }}
                      disabled={loading}
                      aria-invalid={Boolean(errors.identifier)}
                    />
                  </div>
                  {errors.identifier && <p className="field-error">{errors.identifier}</p>}
                </div>

                <div className="field">
                  <div className="field-label-row">
                    <label htmlFor="password">Password</label>
                    <button
                      type="button"
                      className="link-muted link-btn"
                      onClick={() => {
                        setFpEmail(identifier)
                        goTo('forgot')
                      }}
                    >
                      Lupa password?
                    </button>
                  </div>
                  <div className={`field-control ${errors.password ? 'has-error' : ''}`}>
                    <span className="field-icon">
                      <Icon name="lock" size={18} />
                    </span>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Minimal 8 karakter"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (errors.password) setErrors((p) => ({ ...p, password: '', form: '' }))
                      }}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                      disabled={loading}
                    >
                      <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
                    </button>
                  </div>
                  {errors.password && <p className="field-error">{errors.password}</p>}
                </div>

                <div className="field">
                  <label htmlFor="role">Peran</label>
                  <div className="field-control select-control">
                    <select
                      id="role"
                      value={role}
                      onChange={(e) =>
                        setRole(e.target.value as 'auto' | 'anggota' | 'pustakawan' | 'admin')
                      }
                      disabled={loading}
                    >
                      <option value="auto">Deteksi otomatis dari akun</option>
                      <option value="anggota">Anggota</option>
                      <option value="pustakawan">Pustakawan</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <label className="remember">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    disabled={loading}
                  />
                  <span>Ingat saya di perangkat ini</span>
                </label>

                <button type="submit" className="login-submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spin">
                        <Icon name="spinner" size={18} />
                      </span>
                      {step === 'sending' ? 'Mengirim data…' : 'Memverifikasi…'}
                    </>
                  ) : (
                    'Lanjut verifikasi OTP'
                  )}
                </button>
              </form>
              )}

              {loginPhase === 'otp' && (
              <form className="login-form" onSubmit={handleVerifyLoginOtp} noValidate>
                <div className="field">
                  <label htmlFor="login-otp">Kode OTP</label>
                  <div className={`field-control otp-control ${errors.form && !successMsg ? 'has-error' : ''}`}>
                    <span className="field-icon">
                      <Icon name="lock" size={18} />
                    </span>
                    <input
                      id="login-otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="6 digit"
                      maxLength={6}
                      value={loginOtp}
                      onChange={(e) => {
                        setLoginOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                        setErrors((p) => ({ ...p, form: '' }))
                      }}
                      disabled={loading}
                      className="otp-input"
                    />
                  </div>
                </div>
                <button type="submit" className="login-submit" disabled={loading}>
                  {loading ? 'Memverifikasi…' : 'Verifikasi & masuk'}
                </button>
                <div className="otp-actions">
                  <button type="button" className="link-btn primary-link" onClick={resendLoginOtp} disabled={otpCooldown > 0}>
                    {otpCooldown > 0 ? `Kirim ulang (${otpCooldown}s)` : 'Kirim ulang OTP'}
                  </button>
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => {
                      setLoginPhase('credentials')
                      setSuccessMsg('')
                      setErrors({})
                      setPendingUser(null)
                    }}
                  >
                    Kembali ke form login
                  </button>
                </div>
              </form>
              )}

              <p className="login-footer-text">
                Belum punya akun?{' '}
                <button type="button" className="link-btn primary-link" onClick={() => goTo('register')}>
                  Daftar akun baru
                </button>
              </p>
            </>
          )}

          {/* ========== DAFTAR AKUN ========== */}
          {view === 'register' && (
            <>
              <button type="button" className="auth-back" onClick={() => goTo('login')}>
                <Icon name="arrowLeft" size={16} />
                Kembali ke masuk
              </button>

              <div className="login-card-head">
                <h2>Daftar akun baru</h2>
                <p>Buat akun anggota atau pustakawan untuk mulai memakai Aksara.</p>
              </div>

              {regSuccess && (
                <div className="login-alert success" role="status">
                  <Icon name="check" size={18} />
                  <span>{regSuccess}</span>
                </div>
              )}
              {regErrors.form && (
                <div className="login-alert error" role="alert">
                  <Icon name="alert" size={18} />
                  <span>{regErrors.form}</span>
                </div>
              )}

              {regPhase === 'form' && (
              <form className="login-form" onSubmit={handleRegister} noValidate>
                <div className="field">
                  <label htmlFor="reg-name">Nama lengkap</label>
                  <div className={`field-control ${regErrors.name ? 'has-error' : ''}`}>
                    <span className="field-icon">
                      <Icon name="user" size={18} />
                    </span>
                    <input
                      id="reg-name"
                      type="text"
                      autoComplete="name"
                      placeholder="Contoh: Siti Aminah"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      disabled={regLoading}
                    />
                  </div>
                  {regErrors.name && <p className="field-error">{regErrors.name}</p>}
                </div>

                <div className="field">
                  <label htmlFor="reg-email">Email</label>
                  <div className={`field-control ${regErrors.email ? 'has-error' : ''}`}>
                    <span className="field-icon">
                      <Icon name="mail" size={18} />
                    </span>
                    <input
                      id="reg-email"
                      type="email"
                      autoComplete="email"
                      placeholder="nama@email.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      disabled={regLoading}
                    />
                  </div>
                  {regErrors.email && <p className="field-error">{regErrors.email}</p>}
                </div>

                <div className="field-row">
                  <div className="field">
                    <label htmlFor="reg-username">Username</label>
                    <div className={`field-control ${regErrors.username ? 'has-error' : ''}`}>
                      <input
                        id="reg-username"
                        type="text"
                        autoComplete="username"
                        placeholder="siti.aminah"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        disabled={regLoading}
                      />
                    </div>
                    {regErrors.username && <p className="field-error">{regErrors.username}</p>}
                  </div>
                  <div className="field">
                    <label htmlFor="reg-nim">
                      NIM <span className="optional">(opsional)</span>
                    </label>
                    <div className={`field-control ${regErrors.nim ? 'has-error' : ''}`}>
                      <input
                        id="reg-nim"
                        type="text"
                        inputMode="numeric"
                        placeholder="23115001"
                        value={regNim}
                        onChange={(e) => setRegNim(e.target.value)}
                        disabled={regLoading}
                      />
                    </div>
                    {regErrors.nim && <p className="field-error">{regErrors.nim}</p>}
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="reg-role">Daftar sebagai</label>
                  <div className="field-control select-control">
                    <select
                      id="reg-role"
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as 'anggota' | 'pustakawan')}
                      disabled={regLoading}
                    >
                      <option value="anggota">Anggota</option>
                      <option value="pustakawan">Pustakawan</option>
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="reg-password">Password</label>
                  <div className={`field-control ${regErrors.password ? 'has-error' : ''}`}>
                    <span className="field-icon">
                      <Icon name="lock" size={18} />
                    </span>
                    <input
                      id="reg-password"
                      type={showRegPw ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Minimal 8 karakter"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      disabled={regLoading}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowRegPw((v) => !v)}
                      aria-label="Tampilkan password"
                      disabled={regLoading}
                    >
                      <Icon name={showRegPw ? 'eyeOff' : 'eye'} size={18} />
                    </button>
                  </div>
                  {regErrors.password && <p className="field-error">{regErrors.password}</p>}
                </div>

                <div className="field">
                  <label htmlFor="reg-confirm">Konfirmasi password</label>
                  <div className={`field-control ${regErrors.confirm ? 'has-error' : ''}`}>
                    <span className="field-icon">
                      <Icon name="lock" size={18} />
                    </span>
                    <input
                      id="reg-confirm"
                      type={showRegConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Ulangi password"
                      value={regConfirm}
                      onChange={(e) => setRegConfirm(e.target.value)}
                      disabled={regLoading}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowRegConfirm((v) => !v)}
                      aria-label="Tampilkan konfirmasi"
                      disabled={regLoading}
                    >
                      <Icon name={showRegConfirm ? 'eyeOff' : 'eye'} size={18} />
                    </button>
                  </div>
                  {regErrors.confirm && <p className="field-error">{regErrors.confirm}</p>}
                </div>

                <button type="submit" className="login-submit" disabled={regLoading}>
                  {regLoading ? (
                    <>
                      <span className="spin">
                        <Icon name="spinner" size={18} />
                      </span>
                      Menyimpan akun…
                    </>
                  ) : (
                    'Lanjut verifikasi OTP'
                  )}
                </button>
              </form>
              )}

              {regPhase === 'otp' && (
              <form className="login-form" onSubmit={handleVerifyRegOtp} noValidate>
                <div className="field">
                  <label htmlFor="reg-otp">Kode OTP verifikasi</label>
                  <div className="field-control otp-control">
                    <span className="field-icon">
                      <Icon name="lock" size={18} />
                    </span>
                    <input
                      id="reg-otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="6 digit"
                      maxLength={6}
                      value={regOtp}
                      onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      disabled={regLoading}
                      className="otp-input"
                    />
                  </div>
                </div>
                <button type="submit" className="login-submit" disabled={regLoading}>
                  {regLoading ? 'Memverifikasi…' : 'Verifikasi & buat akun'}
                </button>
                <div className="otp-actions">
                  <button type="button" className="link-btn primary-link" onClick={resendRegOtp} disabled={otpCooldown > 0}>
                    {otpCooldown > 0 ? `Kirim ulang (${otpCooldown}s)` : 'Kirim ulang OTP'}
                  </button>
                  <button type="button" className="link-btn" onClick={() => { setRegPhase('form'); setRegSuccess(''); }}>
                    Kembali ke formulir
                  </button>
                </div>
              </form>
              )}

              <p className="login-footer-text">
                Sudah punya akun?{' '}
                <button type="button" className="link-btn primary-link" onClick={() => goTo('login')}>
                  Masuk di sini
                </button>
              </p>
            </>
          )}

          {/* ========== LUPA PASSWORD ========== */}
          {view === 'forgot' && (
            <>
              <button type="button" className="auth-back" onClick={() => goTo('login')}>
                <Icon name="arrowLeft" size={16} />
                Kembali ke masuk
              </button>

              <div className="login-card-head">
                <h2>Lupa password?</h2>
                <p>
                  {fpStep === 'email' &&
                    'Masukkan email atau username akunmu untuk mengatur password baru.'}
                  {fpStep === 'otp' && 'Masukkan kode OTP 6 digit yang dikirim ke emailmu.'}
                  {fpStep === 'reset' && 'Buat password baru untuk akun yang ditemukan.'}
                  {fpStep === 'done' && 'Password sudah diperbarui.'}
                </p>
              </div>

              {fpSuccess && (
                <div className="login-alert success" role="status">
                  <Icon name="check" size={18} />
                  <span>{fpSuccess}</span>
                </div>
              )}
              {fpErrors.form && (
                <div className="login-alert error" role="alert">
                  <Icon name="alert" size={18} />
                  <span>{fpErrors.form}</span>
                </div>
              )}

              {fpStep === 'email' && (
                <form className="login-form" onSubmit={handleForgotCheck} noValidate>
                  <div className="field">
                    <label htmlFor="fp-email">Email / Username</label>
                    <div className={`field-control ${fpErrors.email ? 'has-error' : ''}`}>
                      <span className="field-icon">
                        <Icon name="mail" size={18} />
                      </span>
                      <input
                        id="fp-email"
                        type="text"
                        autoComplete="username"
                        placeholder="email atau username terdaftar"
                        value={fpEmail}
                        onChange={(e) => setFpEmail(e.target.value)}
                        disabled={fpLoading}
                      />
                    </div>
                    {fpErrors.email && <p className="field-error">{fpErrors.email}</p>}
                  </div>

                  <button type="submit" className="login-submit" disabled={fpLoading}>
                    {fpLoading ? (
                      <>
                        <span className="spin">
                          <Icon name="spinner" size={18} />
                        </span>
                        Mencari akun…
                      </>
                    ) : (
                      'Lanjutkan'
                    )}
                  </button>
                </form>
              )}

              {fpStep === 'otp' && (
                <form className="login-form" onSubmit={handleVerifyFpOtp} noValidate>
                  <div className="field">
                    <label htmlFor="fp-otp">Kode OTP</label>
                    <div className="field-control otp-control">
                      <span className="field-icon">
                        <Icon name="lock" size={18} />
                      </span>
                      <input
                        id="fp-otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="6 digit"
                        maxLength={6}
                        value={fpOtp}
                        onChange={(e) => setFpOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        disabled={fpLoading}
                        className="otp-input"
                      />
                    </div>
                  </div>
                  <button type="submit" className="login-submit" disabled={fpLoading}>
                    {fpLoading ? 'Memverifikasi…' : 'Verifikasi OTP'}
                  </button>
                  <div className="otp-actions">
                    <button type="button" className="link-btn primary-link" onClick={resendFpOtp} disabled={otpCooldown > 0}>
                      {otpCooldown > 0 ? `Kirim ulang (${otpCooldown}s)` : 'Kirim ulang OTP'}
                    </button>
                  </div>
                </form>
              )}

              {fpStep === 'reset' && (
                <form className="login-form" onSubmit={handleForgotReset} noValidate>
                  <div className="field">
                    <label>Akun</label>
                    <div className="field-control readonly-control">
                      <span className="field-icon">
                        <Icon name="user" size={18} />
                      </span>
                      <input type="text" value={fpFoundEmail} readOnly disabled />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="fp-new">Password baru</label>
                    <div className={`field-control ${fpErrors.password ? 'has-error' : ''}`}>
                      <span className="field-icon">
                        <Icon name="lock" size={18} />
                      </span>
                      <input
                        id="fp-new"
                        type={showFpPw ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Minimal 8 karakter"
                        value={fpNewPassword}
                        onChange={(e) => setFpNewPassword(e.target.value)}
                        disabled={fpLoading}
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowFpPw((v) => !v)}
                        aria-label="Tampilkan password"
                        disabled={fpLoading}
                      >
                        <Icon name={showFpPw ? 'eyeOff' : 'eye'} size={18} />
                      </button>
                    </div>
                    {fpErrors.password && <p className="field-error">{fpErrors.password}</p>}
                  </div>

                  <div className="field">
                    <label htmlFor="fp-confirm">Konfirmasi password baru</label>
                    <div className={`field-control ${fpErrors.confirm ? 'has-error' : ''}`}>
                      <span className="field-icon">
                        <Icon name="lock" size={18} />
                      </span>
                      <input
                        id="fp-confirm"
                        type={showFpPw ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Ulangi password baru"
                        value={fpConfirm}
                        onChange={(e) => setFpConfirm(e.target.value)}
                        disabled={fpLoading}
                      />
                    </div>
                    {fpErrors.confirm && <p className="field-error">{fpErrors.confirm}</p>}
                  </div>

                  <button type="submit" className="login-submit" disabled={fpLoading}>
                    {fpLoading ? (
                      <>
                        <span className="spin">
                          <Icon name="spinner" size={18} />
                        </span>
                        Menyimpan…
                      </>
                    ) : (
                      'Simpan password baru'
                    )}
                  </button>
                </form>
              )}

              <p className="login-footer-text">
                Ingat passwordmu?{' '}
                <button type="button" className="link-btn primary-link" onClick={() => goTo('login')}>
                  Kembali masuk
                </button>
              </p>
            </>
          )}
        </div>

        <p className="login-footnote">
          aksara — perpustakaan digital ·{' '}
          {view === 'login' && 'Masuk'}
          {view === 'register' && 'Daftar akun'}
          {view === 'forgot' && 'Lupa password'}
        </p>
      </main>
    </div>
  )
}
