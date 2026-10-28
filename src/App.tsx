import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react'
import LoginPage, { type LoginUser } from './LoginPage'

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    book: (
      <>
        <path d="M12 5c-4-3-9-2-9-2v16s5-1 9 2c4-3 9-2 9-2V3s-5-1-9 2Z" />
        <path d="M12 5v16" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    home: (
      <>
        <path d="m3 10 9-7 9 7v10H3Z" />
        <path d="M9 20v-7h6v7" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    bookmark: <path d="M6 3h12v18l-6-4-6 4Z" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    bell: (
      <>
        <path d="M5 17h14l-2-4V9a5 5 0 0 0-10 0v4Z" />
        <path d="M10 21h4" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9 9a3 3 0 1 1 4 3v2m-1 3h.01" />
      </>
    ),
    headphones: (
      <>
        <path d="M4 14v-3a8 8 0 0 1 16 0v3" />
        <rect x="3" y="12" width="4" height="8" rx="2" />
        <rect x="17" y="12" width="4" height="8" rx="2" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6" />
      </>
    ),
    logout: (
      <>
        <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
        <path d="M16 12H8m8 0-3-3m3 3-3 3" />
      </>
    ),
    edit: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 10v6m0-8h.01" />
      </>
    ),
    camera: (
      <>
        <path d="M4 8h3l2-2h6l2 2h3v12H4Z" />
        <circle cx="12" cy="13" r="3.5" />
      </>
    ),
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

type Book = {
  title: string
  author: string
  category: string
  color: string
  label: string
  sub: string
  tag: string
  synopsis: string
}

const CATEGORIES = [
  'Semua buku',
  'Fiksi',
  'Nonfiksi',
  'Pengembangan Diri',
  'Bisnis & Ekonomi',
  'Teknologi',
  'Sejarah',
  'Filsafat',
  'Sains',
  'Psikologi',
  'Sastra Klasik',
  'Romansa',
  'Misteri & Thriller',
  'Fantasi',
  'Biografi',
  'Agama & Spiritualitas',
  'Anak & Remaja',
  'Seni & Desain',
  'Kesehatan',
  'Pendidikan',
]

const INITIAL_BOOKS: Book[] = [
  {
    title: 'Laut Bercerita',
    author: 'Leila S. Chudori',
    category: 'Fiksi',
    color: 'sea',
    label: 'LAUT\nBERCERITA',
    sub: 'LEILA S. CHUDORI',
    tag: 'Terpopuler',
    synopsis:
      'Kisah aktivis yang hilang di era Orde Baru, dituturkan melalui suara mereka yang ditinggalkan. Sebuah novel tentang keberanian, kehilangan, dan sejarah yang tak boleh dilupakan.',
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'Pengembangan Diri',
    color: 'atomic',
    label: 'atomic\nhabits',
    sub: 'JAMES CLEAR',
    tag: 'Pilihan editor',
    synopsis:
      'Panduan praktis membentuk kebiasaan kecil yang berdampak besar. Clear menjelaskan bagaimana sistem, bukan tujuan, yang menentukan kemajuan jangka panjang.',
  },
  {
    title: 'Filosofi Teras',
    author: 'Henry Manampiring',
    category: 'Filsafat',
    color: 'filosofi',
    label: 'FILOSOFI\nTERAS',
    sub: 'HENRY MANAMPIRING',
    tag: '',
    synopsis:
      'Pengantar Stoisisme untuk pembaca modern Indonesia. Membantu mengelola emosi, fokus pada yang bisa dikendalikan, dan hidup lebih tenang di tengah hiruk-pikuk.',
  },
  {
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    category: 'Bisnis & Ekonomi',
    color: 'money',
    label: 'THE\nPSYCHOLOGY\nOF MONEY',
    sub: 'MORGAN HOUSEL',
    tag: 'Terpopuler',
    synopsis:
      'Uang lebih banyak soal perilaku daripada angka. Housel merangkum pelajaran abadi tentang kekayaan, risiko, dan keputusan finansial yang rasional.',
  },
  {
    title: 'Bumi',
    author: 'Tere Liye',
    category: 'Fantasi',
    color: 'bumi',
    label: 'BUMI',
    sub: 'TERE LIYE',
    tag: '',
    synopsis:
      'Petualangan Raib, Seli, dan Ali di dunia paralel yang penuh misteri. Awal dari serial Bumi yang memadukan fantasi, persahabatan, dan keberanian.',
  },
  {
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    category: 'Sejarah',
    color: 'sapiens',
    label: 'SAPIENS',
    sub: 'YUVAL NOAH HARARI',
    tag: 'Rekomendasi',
    synopsis:
      'Sejarah singkat umat manusia: dari pemburu-pengumpul hingga revolusi kognitif, pertanian, dan era modern. Membuka cara pandang baru tentang spesies kita.',
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    category: 'Teknologi',
    color: 'code',
    label: 'CLEAN\nCODE',
    sub: 'ROBERT C. MARTIN',
    tag: '',
    synopsis:
      'Prinsip menulis kode yang rapi, mudah dibaca, dan mudah dirawat. Referensi klasik bagi pengembang yang ingin meningkatkan kualitas perangkat lunak.',
  },
  {
    title: 'Laskar Pelangi',
    author: 'Andrea Hirata',
    category: 'Fiksi',
    color: 'pelangi',
    label: 'LASKAR\nPELANGI',
    sub: 'ANDREA HIRATA',
    tag: 'Klasik',
    synopsis:
      'Sepuluh anak dari keluarga sederhana di Belitung berjuang meraih pendidikan. Kisah inspiratif tentang harapan, persahabatan, dan mimpi.',
  },
  {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    category: 'Psikologi',
    color: 'think',
    label: 'THINKING\nFAST &\nSLOW',
    sub: 'DANIEL KAHNEMAN',
    tag: '',
    synopsis:
      'Dua sistem berpikir manusia: cepat-intuitif dan lambat-analitis. Kahneman mengungkap bias yang memengaruhi keputusan sehari-hari.',
  },
  {
    title: 'Dune',
    author: 'Frank Herbert',
    category: 'Fantasi',
    color: 'dune',
    label: 'DUNE',
    sub: 'FRANK HERBERT',
    tag: '',
    synopsis:
      'Epik fiksi ilmiah di planet gurun Arrakis. Politik, ekologi, dan takdir bertemu dalam salah satu karya fiksi ilmiah paling berpengaruh.',
  },
  {
    title: 'Atomic Design',
    author: 'Brad Frost',
    category: 'Seni & Desain',
    color: 'design',
    label: 'ATOMIC\nDESIGN',
    sub: 'BRAD FROST',
    tag: '',
    synopsis:
      'Metodologi merancang sistem antarmuka dari atom hingga halaman. Cocok untuk desainer dan pengembang produk digital.',
  },
  {
    title: 'Biografi Einstein',
    author: 'Walter Isaacson',
    category: 'Biografi',
    color: 'einstein',
    label: 'EINSTEIN',
    sub: 'WALTER ISAACSON',
    tag: '',
    synopsis:
      'Kehidupan Albert Einstein: kejeniusan, imajinasi, dan sisi manusiawi ilmuwan yang mengubah fisika modern.',
  },
]

const COVER_COLORS = [
  'sea',
  'atomic',
  'filosofi',
  'money',
  'bumi',
  'sapiens',
  'code',
  'pelangi',
  'think',
  'dune',
  'design',
  'einstein',
]

function formatIdNumber(n: number): string {
  return n.toLocaleString('id-ID')
}

function makeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function roleLabelOf(role: LoginUser['role']): string {
  if (role === 'admin') return 'Admin perpustakaan'
  if (role === 'pustakawan') return 'Pustakawan'
  return 'Anggota perpustakaan'
}

function normalizeBook(raw: Record<string, unknown>): Book | null {
  if (typeof raw.title !== 'string' || !raw.title) return null
  return {
    title: raw.title,
    author: typeof raw.author === 'string' ? raw.author : 'Tidak diketahui',
    category: typeof raw.category === 'string' ? raw.category : 'Fiksi',
    color: typeof raw.color === 'string' ? raw.color : 'bumi',
    label: typeof raw.label === 'string' ? raw.label : raw.title.toUpperCase(),
    sub: typeof raw.sub === 'string' ? raw.sub : '',
    tag: typeof raw.tag === 'string' ? raw.tag : '',
    synopsis: typeof raw.synopsis === 'string' ? raw.synopsis : '',
  }
}

function loadCatalog(): Book[] {
  try {
    const raw = localStorage.getItem('aksara_catalog')
    if (!raw) return INITIAL_BOOKS
    const parsed = JSON.parse(raw) as unknown[]
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_BOOKS
    const books = parsed
      .map((item) => normalizeBook(item as Record<string, unknown>))
      .filter((b): b is Book => b !== null)
    // Jika katalog lama lebih sedikit dari default, gabungkan judul baru
    if (books.length < INITIAL_BOOKS.length) {
      const titles = new Set(books.map((b) => b.title.toLowerCase()))
      const merged = [...books]
      for (const b of INITIAL_BOOKS) {
        if (!titles.has(b.title.toLowerCase())) merged.push(b)
      }
      return merged
    }
    return books
  } catch {
    return INITIAL_BOOKS
  }
}

/** Avatar: foto atau inisial */
function Avatar({
  user,
  className = '',
  size,
}: {
  user: Pick<LoginUser, 'initials' | 'avatar' | 'name'>
  className?: string
  size?: 'small' | 'large'
}) {
  const cls = `avatar ${size === 'small' ? 'small' : ''} ${size === 'large' ? 'large' : ''} ${className}`.trim()
  if (user.avatar) {
    return (
      <div className={`${cls} has-photo`} aria-label={user.name}>
        <img src={user.avatar} alt="" />
      </div>
    )
  }
  return <div className={cls}>{user.initials}</div>
}

type SettingsState = {
  notifyPromo: boolean
  notifyReminder: boolean
  compactList: boolean
}

const DEFAULT_SETTINGS: SettingsState = {
  notifyPromo: true,
  notifyReminder: true,
  compactList: false,
}

export default function App() {
  const [user, setUser] = useState<LoginUser | null>(() => {
    try {
      const raw = sessionStorage.getItem('aksara_session')
      if (!raw) return null
      const parsed = JSON.parse(raw) as LoginUser
      if (parsed?.name && parsed?.email && parsed?.role && parsed?.initials) return parsed
    } catch {
      /* ignore */
    }
    return null
  })
  const [active, setActive] = useState('Beranda')
  const [category, setCategory] = useState('Semua buku')
  const [query, setQuery] = useState('')
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('aksara_saved')
      if (raw) {
        const parsed = JSON.parse(raw) as string[]
        if (Array.isArray(parsed)) return parsed
      }
    } catch {
      /* ignore */
    }
    return []
  })
  const [selected, setSelected] = useState<Book | null>(null)
  const [notice, setNotice] = useState(false)
  const [catalog, setCatalog] = useState<Book[]>(loadCatalog)
  const [countPulse, setCountPulse] = useState(false)
  const prevCount = useRef(catalog.length)

  const [menuOpen, setMenuOpen] = useState(false)
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editAvatar, setEditAvatar] = useState<string | undefined>(undefined)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')
  const [profileFlash, setProfileFlash] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [addOpen, setAddOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newCategory, setNewCategory] = useState('Fiksi')
  const [newSynopsis, setNewSynopsis] = useState('')

  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const raw = localStorage.getItem('aksara_settings')
      if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
    } catch {
      /* ignore */
    }
    return DEFAULT_SETTINGS
  })

  const menuRef = useRef<HTMLDivElement>(null)
  const headerMenuRef = useRef<HTMLDivElement>(null)

  const digitalBookCount = catalog.length
  const categoryCount = new Set(catalog.map((b) => b.category)).size

  useEffect(() => {
    try {
      if (user) sessionStorage.setItem('aksara_session', JSON.stringify(user))
      else sessionStorage.removeItem('aksara_session')
    } catch {
      /* ignore */
    }
  }, [user])

  useEffect(() => {
    try {
      localStorage.setItem('aksara_catalog', JSON.stringify(catalog))
    } catch {
      /* ignore */
    }
  }, [catalog])

  useEffect(() => {
    try {
      localStorage.setItem('aksara_saved', JSON.stringify(saved))
    } catch {
      /* ignore */
    }
  }, [saved])

  useEffect(() => {
    try {
      localStorage.setItem('aksara_settings', JSON.stringify(settings))
    } catch {
      /* ignore */
    }
  }, [settings])

  useEffect(() => {
    if (prevCount.current !== digitalBookCount) {
      setCountPulse(true)
      const t = setTimeout(() => setCountPulse(false), 700)
      prevCount.current = digitalBookCount
      return () => clearTimeout(t)
    }
  }, [digitalBookCount])

  // allowed menu guard: sesuaikan menu aktif dengan peran
  useEffect(() => {
    if (!user) return
    const staff = user.role === 'admin' || user.role === 'pustakawan'
    const adminOnly = new Set(['Kelola Katalog'])
    const memberOnly = new Set(['Koleksi Saya', 'Riwayat Bacaan'])
    if (user.role === 'admin' && memberOnly.has(active)) setActive('Beranda')
    if (user.role === 'anggota' && (active === 'Kelola Katalog')) setActive('Beranda')
    if (!staff && adminOnly.has(active)) setActive('Beranda')
  }, [user, active])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node
      if (menuRef.current && !menuRef.current.contains(t)) setMenuOpen(false)
      if (headerMenuRef.current && !headerMenuRef.current.contains(t)) setHeaderMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  if (!user) {
    return (
      <LoginPage
        onSuccess={(u) => {
          setUser(u)
          setNotice(true)
        }}
      />
    )
  }

  const roleLabel = roleLabelOf(user.role)
  const firstName = user.name.split(' ')[0]
  const showHomeContent = active === 'Beranda' || active === 'Jelajahi Buku' || active === 'Koleksi Saya' || active === 'Riwayat Bacaan' || active === 'Kelola Katalog'

  const filtered = catalog.filter(
    (b) =>
      (category === 'Semua buku' || b.category === category) &&
      (active !== 'Koleksi Saya' || saved.includes(b.title)) &&
      `${b.title} ${b.author} ${b.synopsis}`.toLowerCase().includes(query.toLowerCase()),
  )

  function openEditProfile() {
    setEditName(user!.name)
    setEditEmail(user!.email)
    setEditAvatar(user!.avatar)
    setEditError('')
    setEditSuccess('')
    setEditOpen(true)
    setMenuOpen(false)
    setHeaderMenuOpen(false)
  }

  function handleLogout() {
    setMenuOpen(false)
    setHeaderMenuOpen(false)
    setEditOpen(false)
    setUser(null)
    setActive('Beranda')
    setNotice(false)
  }

  function handleAvatarFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setEditError('File harus berupa gambar (JPG, PNG, atau WebP).')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setEditError('Ukuran foto maksimal 2 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditAvatar(reader.result)
        setEditError('')
      }
    }
    reader.readAsDataURL(file)
  }

  function handleSaveProfile(e: FormEvent) {
    e.preventDefault()
    setEditError('')
    setEditSuccess('')
    const name = editName.trim()
    const email = editEmail.trim()
    if (!name) {
      setEditError('Nama tidak boleh kosong.')
      return
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEditError('Email tidak valid.')
      return
    }
    setUser({
      ...user!,
      name,
      email,
      initials: makeInitials(name),
      avatar: editAvatar,
    })
    setEditSuccess('Profil berhasil diperbarui.')
    setProfileFlash(true)
    setTimeout(() => setProfileFlash(false), 1200)
    setTimeout(() => setEditOpen(false), 700)
  }

  function handleAddBook(e: FormEvent) {
    e.preventDefault()
    const title = newTitle.trim()
    const author = newAuthor.trim()
    const synopsis = newSynopsis.trim()
    if (!title || !author) return
    if (catalog.some((b) => b.title.toLowerCase() === title.toLowerCase())) {
      setNotice(true)
      setAddOpen(false)
      return
    }
    const label = title
      .split(' ')
      .slice(0, 3)
      .map((w) => w.toUpperCase())
      .join('\n')
    const color = COVER_COLORS[catalog.length % COVER_COLORS.length]
    setCatalog((prev) => [
      ...prev,
      {
        title,
        author,
        category: newCategory,
        color,
        label,
        sub: author.toUpperCase(),
        tag: 'Baru',
        synopsis:
          synopsis ||
          'Sinopsis belum diisi. Admin atau pustakawan dapat melengkapi deskripsi buku ini.',
      },
    ])
    setNewTitle('')
    setNewAuthor('')
    setNewSynopsis('')
    setNewCategory('Fiksi')
    setAddOpen(false)
    setActive('Jelajahi Buku')
    setCategory('Semua buku')
  }

  function clearLocalData() {
    try {
      localStorage.removeItem('aksara_catalog')
      localStorage.removeItem('aksara_saved')
      localStorage.removeItem('aksara_settings')
    } catch {
      /* ignore */
    }
    setCatalog(INITIAL_BOOKS)
    setSaved([])
    setSettings(DEFAULT_SETTINGS)
    setNotice(true)
  }

  const stats = [
    {
      icon: 'book',
      value: formatIdNumber(digitalBookCount),
      label: 'Buku digital tersedia',
      live: true,
    },
    {
      icon: 'grid',
      value: formatIdNumber(categoryCount),
      label: 'Kategori pilihan',
      live: false,
    },
    {
      icon: 'headphones',
      value: '500+',
      label: 'Audiobook untukmu',
      live: false,
    },
    {
      icon: 'clock',
      value: '24/7',
      label: 'Baca kapan saja',
      live: false,
    },
  ]

  const isStaff = user.role === 'admin' || user.role === 'pustakawan'
  const isAdmin = user.role === 'admin'
  /** Menu navigasi menyesuaikan peran akun */
  const navItems: Array<[string, string]> = isAdmin
    ? [
        ['home', 'Beranda'],
        ['book', 'Jelajahi Buku'],
        ['grid', 'Kelola Katalog'],
        ['settings', 'Pengaturan'],
        ['help', 'Bantuan'],
        ['info', 'Tentang'],
      ]
    : user.role === 'pustakawan'
      ? [
          ['home', 'Beranda'],
          ['book', 'Jelajahi Buku'],
          ['grid', 'Kelola Katalog'],
          ['bookmark', 'Koleksi Saya'],
          ['settings', 'Pengaturan'],
          ['help', 'Bantuan'],
          ['info', 'Tentang'],
        ]
      : [
          ['home', 'Beranda'],
          ['book', 'Jelajahi Buku'],
          ['bookmark', 'Koleksi Saya'],
          ['clock', 'Riwayat Bacaan'],
          ['settings', 'Pengaturan'],
          ['help', 'Bantuan'],
          ['info', 'Tentang'],
        ]

  // Jika menu aktif tidak ada di peran ini (mis. setelah ganti akun), kembali ke Beranda
  const allowedLabels = new Set(navItems.map(([, l]) => l))
  if (!allowedLabels.has(active) && active !== 'Bantuan') {
    // jangan setState di render — fallback tampilan ke beranda content
  }

  return (
    <div className={`app-shell ${settings.compactList ? 'compact-list' : ''}`}>
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault()
            setActive('Beranda')
          }}
        >
          <span className="brand-icon">
            <Icon name="book" size={24} />
          </span>
          aksara
          <span className="brand-dot">.</span>
        </a>
        <div className="sidebar-label">
          {isAdmin ? 'PANEL ADMIN' : user.role === 'pustakawan' ? 'PANEL PUSTAKAWAN' : 'RUANG BACA DIGITALMU'}
        </div>
        <nav>
          {navItems.map(([icon, label]) => (
            <button
              key={label}
              type="button"
              className={`nav-item ${active === label ? 'active' : ''}`}
              onClick={() => {
                setActive(label)
                if (label === 'Jelajahi Buku' || label === 'Beranda') {
                  setCategory('Semua buku')
                  setQuery('')
                }
              }}
            >
              <Icon name={icon} />
              {label}
              {label === 'Koleksi Saya' && <span className="count">{saved.length}</span>}
            </button>
          ))}
        </nav>
        <div className="reading-card">
          <span className="tiny-book">
            <Icon name="book" size={24} />
          </span>
          <h3>
            Sedikit demi sedikit,
            <br />
            jadi banyak wawasan.
          </h3>
          <p>
            Luangkan 15 menit untuk
            <br />
            membaca hari ini.
          </p>
          <div className="reading-dots">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <span>Perjalanan hebat dimulai dari satu halaman.</span>
        </div>

        <div className="sidebar-bottom">
          <button type="button" onClick={() => setActive('Bantuan')}>
            <Icon name="help" />
            Bantuan & Panduan
          </button>

          <div className={`profile-wrap ${profileFlash ? 'flash' : ''}`} ref={menuRef}>
            <button
              type="button"
              className={`profile profile-trigger ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <Avatar user={user} />
              <div className="profile-text">
                <strong>{user.name}</strong>
                <small>{roleLabel}</small>
              </div>
              <span className={`chevron-wrap ${menuOpen ? 'up' : ''}`}>
                <Icon name="chevron" size={16} />
              </span>
            </button>

            {menuOpen && (
              <div className="profile-menu" role="menu">
                <div className="profile-menu-head">
                  <Avatar user={user} />
                  <div>
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </div>
                </div>
                <button type="button" role="menuitem" onClick={openEditProfile}>
                  <Icon name="edit" size={16} />
                  Edit profil & foto
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setActive('Pengaturan')
                    setMenuOpen(false)
                  }}
                >
                  <Icon name="settings" size={16} />
                  Pengaturan
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setActive('Tentang')
                    setMenuOpen(false)
                  }}
                >
                  <Icon name="info" size={16} />
                  Tentang Aksara
                </button>
                <button type="button" role="menuitem" className="danger" onClick={handleLogout}>
                  <Icon name="logout" size={16} />
                  Keluar dari akun
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main>
        <header>
          <div className="breadcrumb">
            Perpustakaan <span>/</span> <strong>{active}</strong>
          </div>
          <div className="header-right">
            <span className="date">
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <button
              type="button"
              className="notification"
              aria-label="Notifikasi"
              onClick={() => setNotice(!notice)}
            >
              <Icon name="bell" />
              <i />
            </button>
            <div className="header-profile" ref={headerMenuRef}>
              <button
                type="button"
                className="header-avatar-btn"
                onClick={() => setHeaderMenuOpen((v) => !v)}
                aria-label="Menu akun"
                aria-expanded={headerMenuOpen}
              >
                <Avatar user={user} size="small" />
              </button>
              {headerMenuOpen && (
                <div className="profile-menu header-menu" role="menu">
                  <div className="profile-menu-head">
                    <Avatar user={user} />
                    <div>
                      <strong>{user.name}</strong>
                      <small>{user.email}</small>
                    </div>
                  </div>
                  <button type="button" role="menuitem" onClick={openEditProfile}>
                    <Icon name="edit" size={16} />
                    Edit profil & foto
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setActive('Pengaturan')
                      setHeaderMenuOpen(false)
                    }}
                  >
                    <Icon name="settings" size={16} />
                    Pengaturan
                  </button>
                  <button type="button" role="menuitem" className="danger" onClick={handleLogout}>
                    <Icon name="logout" size={16} />
                    Keluar dari akun
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {notice && (
          <div className="notice">
            Selamat datang di Aksara. Temukan buku, simpan ke koleksi, dan mulai perjalanan
            membacamu.
            <button type="button" onClick={() => setNotice(false)}>
              Tutup
            </button>
          </div>
        )}

        <div className="content">
          <div key={active} className="page-transition">
          {/* ========== PENGATURAN ========== */}
          {active === 'Pengaturan' && (
            <section className="page-panel">
              <div className="page-panel-head">
                <div className="eyebrow">AKUN</div>
                <h1>Pengaturan</h1>
                <p>Sesuaikan pengalaman membacamu di Aksara.</p>
              </div>

              <div className="settings-grid">
                <article className="settings-card">
                  <h3>Notifikasi</h3>
                  <label className="settings-toggle">
                    <span>
                      <strong>Pengingat baca harian</strong>
                      <small>Ingatkan untuk membaca 15 menit setiap hari</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.notifyReminder}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, notifyReminder: e.target.checked }))
                      }
                    />
                  </label>
                  <label className="settings-toggle">
                    <span>
                      <strong>Info koleksi baru</strong>
                      <small>Beritahu saat ada buku baru di katalog</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.notifyPromo}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, notifyPromo: e.target.checked }))
                      }
                    />
                  </label>
                </article>

                <article className="settings-card">
                  <h3>Tampilan</h3>
                  <label className="settings-toggle">
                    <span>
                      <strong>Daftar buku ringkas</strong>
                      <small>Kurangi jarak antar kartu di katalog</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.compactList}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, compactList: e.target.checked }))
                      }
                    />
                  </label>
                </article>

                <article className="settings-card">
                  <h3>Profil</h3>
                  <p className="settings-desc">
                    Ubah nama, email, dan foto profil yang tampil di sidebar serta header.
                  </p>
                  <button type="button" className="primary-button settings-btn" onClick={openEditProfile}>
                    <Icon name="edit" size={16} />
                    Edit profil & foto
                  </button>
                </article>

                <article className="settings-card danger-zone">
                  <h3>Data lokal</h3>
                  <p className="settings-desc">
                    Menghapus katalog tambahan, koleksi, dan pengaturan di perangkat ini. Akun demo
                    dan buku bawaan akan dimuat ulang.
                  </p>
                  <button type="button" className="btn-ghost danger-btn" onClick={clearLocalData}>
                    Pulihkan data default
                  </button>
                </article>
              </div>
            </section>
          )}


          {/* ========== BANTUAN & PANDUAN ========== */}
          {active === 'Bantuan' && (
            <section className="page-panel help-panel">
              <div className="page-panel-head">
                <div className="eyebrow">PANDUAN</div>
                <h1>Bantuan & Panduan</h1>
                <p>
                  Panduan singkat memakai Aksara: masuk, mencari buku, mengelola koleksi, dan
                  fitur untuk pustakawan/admin.
                </p>
              </div>

              <div className="help-grid">
                <article className="help-card">
                  <span className="help-num">01</span>
                  <h3>Masuk ke akun</h3>
                  <p>
                    Gunakan email, NIM, atau username beserta password. Centang <strong>Ingat
                    saya</strong> agar email tersimpan di perangkat ini. Pilih peran{' '}
                    <strong>Deteksi otomatis</strong> jika tidak yakin.
                  </p>
                  <ul>
                    <li>Akun demo: aditya@aksara.id / Aksara123</li>
                    <li>Belum punya akun? Klik <strong>Daftar akun baru</strong></li>
                    <li>Lupa password? Gunakan tautan di samping field password</li>
                  </ul>
                </article>

                <article className="help-card">
                  <span className="help-num">02</span>
                  <h3>Menjelajahi katalog</h3>
                  <p>
                    Dari <strong>Beranda</strong> atau <strong>Jelajahi Buku</strong>, saring
                    menurut genre, atau ketik judul/penulis/sinopsis di kotak pencarian.
                  </p>
                  <ul>
                    <li>Klik sampul atau judul untuk membaca sinopsis</li>
                    <li>Ikon bookmark menyimpan buku ke <strong>Koleksi Saya</strong></li>
                    <li>Angka &quot;Buku digital tersedia&quot; mengikuti jumlah katalog secara realtime</li>
                  </ul>
                </article>

                <article className="help-card">
                  <span className="help-num">03</span>
                  <h3>Profil & foto</h3>
                  <p>
                    Klik avatar di sidebar atau header, lalu pilih <strong>Edit profil &amp;
                    foto</strong>. Unggah gambar JPG/PNG/WebP (maks. 2 MB).
                  </p>
                  <ul>
                    <li>Nama dan email dapat diubah kapan saja</li>
                    <li>Peran akun tidak dapat diubah sendiri</li>
                    <li>Keluar dari akun mengakhiri sesi di tab ini</li>
                  </ul>
                </article>

                <article className="help-card">
                  <span className="help-num">04</span>
                  <h3>Pengaturan</h3>
                  <p>
                    Menu <strong>Pengaturan</strong> mengatur notifikasi, tampilan daftar ringkas,
                    dan pemulihan data lokal di browser.
                  </p>
                  <ul>
                    <li>Pengingat baca harian (simulasi preferensi)</li>
                    <li>Info koleksi baru</li>
                    <li>Pulihkan data default jika katalog terlihat aneh</li>
                  </ul>
                </article>

                <article className="help-card">
                  <span className="help-num">05</span>
                  <h3>Untuk pustakawan &amp; admin</h3>
                  <p>
                    Login sebagai pustakawan atau admin untuk menambah buku ke katalog, termasuk
                    genre dan <strong>sinopsis</strong>.
                  </p>
                  <ul>
                    <li>pustakawan@aksara.id / Aksara123</li>
                    <li>admin@aksara.id / Aksara123</li>
                    <li>Tombol <strong>Tambah buku</strong> muncul di area katalog</li>
                  </ul>
                </article>

                <article className="help-card help-card-tip">
                  <span className="help-num">?</span>
                  <h3>Tips &amp; masalah umum</h3>
                  <ul>
                    <li>
                      <strong>Tulisan terlalu kecil / CSS lama:</strong> hard refresh dengan
                      Ctrl+Shift+R (Windows) atau Cmd+Shift+R (Mac).
                    </li>
                    <li>
                      <strong>Login gagal berulang:</strong> setelah 5 kali salah, tunggu sebentar
                      atau pastikan password minimal 8 karakter.
                    </li>
                    <li>
                      <strong>Buku hilang setelah refresh:</strong> data disimpan di localStorage
                      browser; jangan hapus data situs.
                    </li>
                    <li>
                      <strong>Prototipe:</strong> belum ada backend produksi — semua berjalan di
                      browser untuk demonstrasi.
                    </li>
                  </ul>
                </article>
              </div>
            </section>
          )}

          {/* ========== TENTANG ========== */}
          {active === 'Tentang' && (
            <section className="page-panel about-panel">
              <div className="page-panel-head">
                <div className="eyebrow">AKSARA</div>
                <h1>Tentang website ini</h1>
                <p>Perancangan, pembangunan, dan tujuan Sistem Perpustakaan Digital Aksara.</p>
              </div>

              <div className="about-grid">
                <article className="about-card">
                  <h3>Apa itu Aksara?</h3>
                  <p>
                    Aksara adalah prototipe <strong>Sistem Perpustakaan Digital</strong> yang
                    dirancang sebagai ruang baca modern: anggota dapat menjelajah katalog,
                    menyimpan koleksi, dan mengelola profil; pustakawan serta admin dapat menambah
                    buku beserta sinopsisnya.
                  </p>
                </article>

                <article className="about-card">
                  <h3>Perancangan</h3>
                  <p>
                    Desain UI dimulai dari konsep Figma dengan nuansa tenang perpustakaan: hijau
                    hutan <code>#245943</code>, aksen krem/emas <code>#c29559</code>, tipografi DM
                    Sans + Playfair Display, dan layout sidebar + area baca yang mobile-friendly.
                  </p>
                  <ul>
                    <li>Mobile-first dan responsif</li>
                    <li>Hierarki visual jelas (brand → form → aksi utama)</li>
                    <li>Aksesibilitas: label, kontras, navigasi keyboard</li>
                  </ul>
                </article>

                <article className="about-card">
                  <h3>Pembangunan</h3>
                  <p>
                    Dibangun bertahap untuk mata kuliah / proyek multi-platform. Tahap web
                    menggunakan:
                  </p>
                  <ul>
                    <li>
                      <strong>Frontend:</strong> React 19, Vite, TypeScript, Tailwind CSS
                    </li>
                    <li>
                      <strong>Alur auth:</strong> login → daftar → lupa password (simulasi klien)
                    </li>
                    <li>
                      <strong>Data:</strong> state React + localStorage / sessionStorage
                    </li>
                    <li>
                      <strong>Roadmap:</strong> API backend, desktop (Electron/Tauri), mobile (RN/PWA)
                    </li>
                  </ul>
                </article>

                <article className="about-card">
                  <h3>Alur Input → Proses → Output</h3>
                  <p>
                    Modul login dirancang mengikuti pola IPO: validasi input, sanitasi, proses
                    autentikasi (simulasi), lalu output sukses/gagal dengan pesan yang aman dan
                    status loading yang jelas.
                  </p>
                </article>

                <article className="about-card about-meta">
                  <h3>Identitas proyek</h3>
                  <dl>
                    <div>
                      <dt>Nama sistem</dt>
                      <dd>Aksara — Perpustakaan Digital</dd>
                    </div>
                    <div>
                      <dt>Pengguna</dt>
                      <dd>Anggota, Pustakawan, Admin</dd>
                    </div>
                    <div>
                      <dt>Versi UI</dt>
                      <dd>1.2 · Frontend prototipe</dd>
                    </div>
                    <div>
                      <dt>Catatan</dt>
                      <dd>
                        Ini prototipe pembelajaran. Data tersimpan di browser; belum terhubung
                        database produksi.
                      </dd>
                    </div>
                  </dl>
                </article>
              </div>
            </section>
          )}

          {/* ========== BERANDA / KATALOG ========== */}
          {showHomeContent && (
            <>
              {active === 'Beranda' && (
                <>
                  <section className="greeting">
                    <div>
                      <div className="eyebrow">SELALU ADA CERITA BARU</div>
                      <h1>
                        {isAdmin
                          ? `Halo, ${firstName}. Pantau & kelola perpustakaan hari ini.`
                          : user.role === 'pustakawan'
                            ? `Halo, ${firstName}. Siap mengelola koleksi hari ini?`
                            : `Halo, ${firstName}. Mau baca apa hari ini?`}
                      </h1>
                      <p>
                        {isAdmin
                          ? 'Tambah buku, lengkapi sinopsis, dan jaga kualitas katalog digital.'
                          : user.role === 'pustakawan'
                            ? 'Perbarui katalog, bantu anggota menemukan bacaan terbaik.'
                            : 'Jelajahi dunia lewat ribuan buku. Satu halaman, sejuta kemungkinan.'}
                      </p>
                    </div>
                    <span className="member-badge">
                      <i /> Akses tanpa batas
                    </span>
                  </section>

                  <section className="hero">
                    <div className="hero-copy">
                      <div className="hero-kicker">
                        <span /> PERPUSTAKAAN DALAM GENGGAMAN
                      </div>
                      <h2>
                        Buka buku.
                        <br />
                        Buka <em>dunia baru.</em>
                      </h2>
                      <p>
                        Dari cerita yang menginspirasi hingga ilmu yang mengubah
                        <br className="desktop" /> cara pandang. Temukan bacaan berikutnya di sini.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setActive('Jelajahi Buku')
                          document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
                        }}
                      >
                        Jelajahi koleksi <Icon name="arrow" size={18} />
                      </button>
                      <div className="hero-social">
                        <div className="avatar-stack">
                          <span>R</span>
                          <span>N</span>
                          <span>D</span>
                          <span>A</span>
                        </div>
                        <span>
                          Bersama <strong>12.000+</strong> pembaca lainnya
                        </span>
                      </div>
                    </div>
                    <div className="hero-art" aria-hidden="true">
                      <div className="orbit orbit-one" />
                      <div className="orbit orbit-two" />
                      <span className="spark s1">✦</span>
                      <span className="spark s2">✧</span>
                      <div className="art-book back-book">
                        <span>THE ART OF</span>
                        <strong>
                          slow
                          <br />
                          living
                        </strong>
                        <small>FIND BEAUTY IN EVERYDAY</small>
                        <div className="sun" />
                      </div>
                      <div className="art-book front-book">
                        <small>SEBUAH PERJALANAN MENEMUKAN DIRI</small>
                        <strong>
                          Halaman
                          <br />
                          berikutnya.
                        </strong>
                        <div className="book-window">
                          <div />
                          <i />
                        </div>
                        <span>CERITA UNTUK TUMBUH</span>
                      </div>
                      <div className="floating-label">
                        <Icon name="book" size={17} />
                        <span>Petualangan baru menantimu</span>
                      </div>
                    </div>
                  </section>

                  <section className="stats">
                    {stats.map((s) => (
                      <div className="stat" key={s.label}>
                        <span className="stat-icon">
                          <Icon name={s.icon} size={22} />
                        </span>
                        <div>
                          <strong
                            className={s.live && countPulse ? 'stat-value pulse' : 'stat-value'}
                          >
                            {s.value}
                            {s.live && <span className="live-dot" title="Realtime" />}
                          </strong>
                          <span>{s.label}</span>
                        </div>
                      </div>
                    ))}
                  </section>
                </>
              )}

              <section id="catalog">
                <div className="section-heading">
                  <div>
                    <h2>
                      {active === 'Koleksi Saya'
                        ? 'Koleksi pribadi'
                        : active === 'Riwayat Bacaan'
                          ? 'Mulai perjalanan membacamu'
                          : active === 'Kelola Katalog'
                            ? 'Kelola katalog perpustakaan'
                            : active === 'Jelajahi Buku'
                              ? 'Jelajahi seluruh katalog'
                              : 'Temukan bacaan favoritmu'}
                    </h2>
                    <p>
                      {formatIdNumber(digitalBookCount)} buku · {formatIdNumber(categoryCount)}{' '}
                      genre tersedia
                    </p>
                  </div>
                  <div className="heading-actions">
                    {isStaff && (
                      <button type="button" className="add-book-btn" onClick={() => setAddOpen(true)}>
                        <Icon name="plus" size={16} />
                        Tambah buku
                      </button>
                    )}
                    <label className="search">
                      <Icon name="search" size={18} />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Cari judul, penulis, sinopsis..."
                      />
                      <span>⌘ K</span>
                    </label>
                  </div>
                </div>

                <div className="category-row">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={category === c ? 'selected' : ''}
                      onClick={() => setCategory(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                
                {active === 'Kelola Katalog' && (
                  <div className="staff-banner notice" style={{ margin: '0 0 18px' }}>
                    Mode {user.role === 'admin' ? 'admin' : 'pustakawan'}: kamu dapat menambah buku dan mengisi sinopsis.
                    Anggota hanya melihat katalog tanpa tombol kelola.
                  </div>
                )}

                <div className="collection-heading">
                  <h3>
                    {category === 'Semua buku' ? 'Rekomendasi untukmu' : category}
                    <span>DIPILIH DENGAN HATI</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setActive('Jelajahi Buku')
                      setCategory('Semua buku')
                      setQuery('')
                    }}
                  >
                    Lihat semua <Icon name="arrow" size={16} />
                  </button>
                </div>

                <div className="book-grid">
                  {filtered.map((book, idx) => (
                    <article className="book-card anim-card" style={{ animationDelay: `${Math.min(idx, 12) * 40}ms` }} key={book.title}>
                      <div className={`cover-area ${book.color}`} onClick={() => setSelected(book)}>
                        <div className="book-cover">
                          <span className="cover-author">{book.sub}</span>
                          <strong>
                            {book.label.split('\n').map((line, i) => (
                              <span key={i}>{line}</span>
                            ))}
                          </strong>
                          <div className="cover-illustration" />
                          <small>
                            {book.synopsis
                              ? book.synopsis.slice(0, 48) + (book.synopsis.length > 48 ? '…' : '')
                              : 'Sebuah buku untuk perjalananmu'}
                          </small>
                        </div>
                        {book.tag && <span className="book-tag">{book.tag}</span>}
                        <button
                          type="button"
                          className={`save-button ${saved.includes(book.title) ? 'is-saved' : ''}`}
                          aria-label={`Simpan ${book.title}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSaved((s) =>
                              s.includes(book.title)
                                ? s.filter((t) => t !== book.title)
                                : [...s, book.title],
                            )
                          }}
                        >
                          <Icon name="bookmark" size={16} />
                        </button>
                      </div>
                      <div className="book-info">
                        <span className="book-category">{book.category}</span>
                        <button type="button" className="book-title" onClick={() => setSelected(book)}>
                          {book.title}
                        </button>
                        <p>{book.author}</p>
                        <div className="book-meta">
                          <span className="available">Tersedia digital</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                {filtered.length === 0 && (
                  <div className="empty">
                    Belum ada buku di sini. Coba genre lain atau simpan buku ke koleksimu.
                  </div>
                )}
              </section>
            </>
          )}

          </div>
          <footer>
            <span>Ruang untuk membaca. Ruang untuk bertumbuh.</span>
            <span>aksara — perpustakaan digital</span>
          </footer>
        </div>
      </main>

      {/* Modal detail buku + sinopsis */}
      {selected && (
        <div className="modal-backdrop anim-backdrop" onClick={() => setSelected(null)}>
          <section className="modal anim-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setSelected(null)}>
              ×
            </button>
            <span className="eyebrow">KENALI BACAAN BERIKUTNYA</span>
            <h2>{selected.title}</h2>
            <p>Oleh {selected.author}</p>
            <div className="modal-detail">
              <span>{selected.category}</span>
              <span>Tersedia digital</span>
            </div>
            <div className="synopsis-block">
              <h4>Sinopsis</h4>
              <p>
                {selected.synopsis ||
                  'Sinopsis belum tersedia untuk buku ini.'}
              </p>
            </div>
            <button
              type="button"
              className="primary-button"
              onClick={() =>
                setSaved((s) =>
                  s.includes(selected.title) ? s : [...s, selected.title],
                )
              }
            >
              {saved.includes(selected.title) ? 'Tersimpan di koleksi' : 'Tambahkan ke koleksi'}
              <Icon name="bookmark" size={18} />
            </button>
            <small className="demo-note">Pratinjau katalog. Isi penuh buku digital menyusul.</small>
          </section>
        </div>
      )}

      {/* Modal edit profil + foto */}
      {editOpen && (
        <div className="modal-backdrop anim-backdrop" onClick={() => setEditOpen(false)}>
          <section className="modal profile-modal anim-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setEditOpen(false)}>
              ×
            </button>
            <span className="eyebrow">AKUN AKSARA</span>
            <h2>Edit profil</h2>
            <p className="modal-sub">Perbarui nama, email, dan foto profil.</p>

            <div className="edit-avatar-preview">
              <div className="avatar-edit-wrap">
                <Avatar
                  user={{
                    name: editName || user.name,
                    initials: makeInitials(editName || user.name),
                    avatar: editAvatar,
                  }}
                  size="large"
                />
                <button
                  type="button"
                  className="avatar-camera-btn"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Ubah foto profil"
                >
                  <Icon name="camera" size={14} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={handleAvatarFile}
                />
              </div>
              <div>
                <strong>{editName || user.name}</strong>
                <small>{roleLabel}</small>
                <div className="avatar-actions">
                  <button type="button" className="link-btn primary-link" onClick={() => fileInputRef.current?.click()}>
                    Ganti foto
                  </button>
                  {editAvatar && (
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => setEditAvatar(undefined)}
                    >
                      Hapus foto
                    </button>
                  )}
                </div>
              </div>
            </div>

            <form className="edit-form" onSubmit={handleSaveProfile}>
              <label>
                Nama lengkap
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </label>
              <label className="readonly-field">
                Peran
                <input type="text" value={roleLabel} readOnly disabled />
              </label>

              {editError && (
                <p className="edit-msg error" role="alert">
                  {editError}
                </p>
              )}
              {editSuccess && (
                <p className="edit-msg success" role="status">
                  {editSuccess}
                </p>
              )}

              <div className="edit-actions">
                <button type="button" className="btn-ghost" onClick={() => setEditOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="primary-button">
                  Simpan perubahan
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Modal tambah buku + sinopsis */}
      {addOpen && (
        <div className="modal-backdrop anim-backdrop" onClick={() => setAddOpen(false)}>
          <section className="modal profile-modal modal-wide anim-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setAddOpen(false)}>
              ×
            </button>
            <span className="eyebrow">KATALOG</span>
            <h2>Tambah buku digital</h2>
            <p className="modal-sub">
              Lengkapi data buku termasuk sinopsis. Angka katalog akan naik otomatis (sekarang{' '}
              {formatIdNumber(digitalBookCount)}).
            </p>
            <form className="edit-form" onSubmit={handleAddBook}>
              <label>
                Judul buku
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Laskar Pelangi"
                  required
                />
              </label>
              <label>
                Penulis
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="Contoh: Andrea Hirata"
                  required
                />
              </label>
              <label>
                Genre / kategori
                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                  {CATEGORIES.filter((c) => c !== 'Semua buku').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Sinopsis / deskripsi isi buku
                <textarea
                  value={newSynopsis}
                  onChange={(e) => setNewSynopsis(e.target.value)}
                  placeholder="Tuliskan ringkasan isi buku, tema utama, dan untuk siapa buku ini cocok..."
                  rows={5}
                  className="synopsis-input"
                />
              </label>
              <div className="edit-actions">
                <button type="button" className="btn-ghost" onClick={() => setAddOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="primary-button">
                  Tambahkan ke katalog
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
