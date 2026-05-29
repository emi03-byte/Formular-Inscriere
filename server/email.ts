import nodemailer from 'nodemailer'
import type { FormPayload } from './types.js'

const MAX_PDF_BYTES = 4 * 1024 * 1024

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatDateRo(isoDate: string): string {
  return new Intl.DateTimeFormat('ro-RO', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(isoDate))
}

function adminEmailText(parentName: string): string {
  return `Înscriere nouă — ${parentName}`
}

function childrenHtml(payload: FormPayload): string {
  return payload.children
    .map(
      (child) =>
        `<li>${escapeHtml(child.fullName.trim())} — ${escapeHtml(String(child.age))} ani</li>`,
    )
    .join('')
}

export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.ADMIN_NOTIFICATION_EMAIL,
  )
}

export function parsePdfAttachment(
  pdfBase64: string | undefined,
  fileName: string,
): { filename: string; content: Buffer } | null {
  if (!pdfBase64?.trim()) {
    return null
  }

  const normalized = pdfBase64.replace(/^data:application\/pdf;base64,/, '').trim()
  if (!/^[A-Za-z0-9+/=\r\n]+$/.test(normalized)) {
    throw new Error('PDF-ul trimis nu este valid.')
  }

  const content = Buffer.from(normalized, 'base64')
  if (content.length === 0 || content.length > MAX_PDF_BYTES) {
    throw new Error('PDF-ul trimis nu este valid.')
  }

  return {
    filename: fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`,
    content,
  }
}

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

function buildPdfFileName(payload: FormPayload): string {
  const safeName = payload.parent.fullName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()

  return `confirmare-inscriere-${safeName || 'parinte'}.pdf`
}

function parentEmailHtml(payload: FormPayload, createdAt: string): string {
  const childrenBlock =
    payload.children.length === 1
      ? `<p>Vă confirmăm înscrierea copilului <strong>${escapeHtml(payload.children[0].fullName.trim())}</strong>, în vârstă de ${escapeHtml(String(payload.children[0].age))} ani.</p>`
      : `<p>Vă confirmăm înscrierea următorilor copii:</p><ul>${childrenHtml(payload)}</ul>`

  return `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #1a2332; line-height: 1.55;">
      <p>Dragă părinte <strong>${escapeHtml(payload.parent.fullName.trim())}</strong>,</p>
      <p>Vă mulțumim! Formularul de înscriere a fost trimis și înregistrat cu succes.</p>
      ${childrenBlock}
      <p><strong>Data:</strong> ${escapeHtml(formatDateRo(createdAt))}</p>
      <p>Găsiți atașat PDF-ul de confirmare.</p>
    </div>
  `
}

export async function sendEnrollmentEmails(
  payload: FormPayload,
  _submissionId: number,
  createdAt: string,
): Promise<void> {
  if (!isEmailConfigured()) {
    return
  }

  const transport = createTransport()
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER!
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL!
  const fileName = buildPdfFileName(payload)
  const attachment = parsePdfAttachment(payload.pdfBase64, fileName)
  const attachments = attachment ? [attachment] : []

  const parentName = payload.parent.fullName.trim()
  const adminSubject = adminEmailText(parentName)

  await transport.sendMail({
    from,
    to: payload.parent.email.trim(),
    subject: 'Confirmare înscriere',
    html: parentEmailHtml(payload, createdAt),
    attachments,
  })

  await transport.sendMail({
    from,
    to: adminEmail,
    subject: adminSubject,
    text: adminSubject,
    html: `<p>${escapeHtml(adminSubject)}</p>`,
    attachments,
  })
}
