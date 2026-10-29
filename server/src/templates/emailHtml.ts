/** Template HTML email responsif (bahasa Indonesia) */

function shell(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f3;font-family:Arial,Helvetica,sans-serif;color:#273b35;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6f3;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e6eae4;">
        <tr>
          <td style="background:#245943;padding:20px 24px;color:#fff;">
            <strong style="font-size:20px;letter-spacing:-0.5px;">aksara</strong>
            <span style="color:#c29559;">.</span>
            <div style="font-size:12px;opacity:.85;margin-top:4px;">Perpustakaan Digital</div>
          </td>
        </tr>
        <tr><td style="padding:28px 24px;">${content}</td></tr>
        <tr>
          <td style="padding:16px 24px;background:#f7f9f6;font-size:12px;color:#8d958e;line-height:1.5;">
            Email ini dikirim otomatis oleh sistem Aksara. Jangan bagikan kode kepada siapa pun.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export function referralEmailHtml(name: string, code: string, expiresHours: number): string {
  return shell(
    'Kode Referral Aksara',
    `
    <p style="margin:0 0 12px;font-size:16px;">Halo <strong>${escapeHtml(name)}</strong>,</p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#4a5c55;">
      Berikut kode referral unik milikmu. Masukkan di menu <strong>Kode Referral</strong> sebelum kedaluwarsa.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <div style="display:inline-block;background:#edf3ed;border:1px dashed #245943;border-radius:10px;padding:14px 28px;font-size:28px;font-weight:700;letter-spacing:4px;color:#245943;">
        ${escapeHtml(code)}
      </div>
    </div>
    <p style="margin:0;font-size:13px;color:#8d958e;">Berlaku ${expiresHours} jam sejak dikirim. Jangan bagikan kode ini.</p>
  `,
  )
}

export function resetPasswordEmailHtml(name: string, code: string, expiresMin: number): string {
  return shell(
    'Kode Reset Password',
    `
    <p style="margin:0 0 12px;font-size:16px;">Halo <strong>${escapeHtml(name)}</strong>,</p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#4a5c55;">
      Kami menerima permintaan reset password. Gunakan kode berikut di halaman reset password.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <div style="display:inline-block;background:#edf3ed;border:1px dashed #245943;border-radius:10px;padding:14px 28px;font-size:28px;font-weight:700;letter-spacing:6px;color:#245943;">
        ${escapeHtml(code)}
      </div>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:#8d958e;">Kode berlaku ${expiresMin} menit. Jika kamu tidak meminta reset, abaikan email ini.</p>
  `,
  )
}

export function passwordChangedEmailHtml(name: string): string {
  return shell(
    'Password Berhasil Diubah',
    `
    <p style="margin:0 0 12px;font-size:16px;">Halo <strong>${escapeHtml(name)}</strong>,</p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#4a5c55;">
      Password akun Aksara-mu telah berhasil diubah. Semua sesi aktif telah diakhiri demi keamanan.
      Jika ini bukan kamu, segera hubungi admin perpustakaan.
    </p>
  `,
  )
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
