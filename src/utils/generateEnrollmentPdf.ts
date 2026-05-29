import html2canvas from 'html2canvas'
import {
  PRIVACY_POLICY_TEXT,
  TERMS_TEXT,
} from '../content/legalTexts'
import type { FormPayload } from '../types'

export type EnrollmentPdfFile = {
  blob: Blob
  fileName: string
}

function formatDateRo(): string {
  return new Intl.DateTimeFormat('ro-RO', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date())
}

function sanitizeFileName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

function buildFileName(payload: FormPayload): string {
  return `confirmare-inscriere-${sanitizeFileName(payload.parent.fullName) || 'parinte'}.pdf`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function childrenText(payload: FormPayload): string {
  if (payload.children.length === 1) {
    const child = payload.children[0]
    return `Vă confirmăm înscrierea copilului <strong>${escapeHtml(child.fullName)}</strong>, în vârstă de ${escapeHtml(child.age)} ani.`
  }

  const items = payload.children
    .map(
      (child) =>
        `<li>${escapeHtml(child.fullName)} — ${escapeHtml(child.age)} ani</li>`,
    )
    .join('')

  return `Vă confirmăm înscrierea următorilor copii:<ul style="margin: 8px 0; padding-left: 20px;">${items}</ul>`
}

function buildPdfPage1Html(payload: FormPayload): string {
  const phoneLine = payload.parent.phone.trim()
    ? `<p style="margin: 0 0 4px;"><strong>Telefon:</strong> ${escapeHtml(payload.parent.phone.trim())}</p>`
    : ''

  return `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #1a2332; font-size: 14px; line-height: 1.55; background: #ffffff; padding: 8px;">
      <h1 style="font-size: 22px; margin: 0 0 20px; color: #1a2332;">Confirmare înscriere</h1>

      <p style="margin: 0 0 14px;">Dragă părinte <strong>${escapeHtml(payload.parent.fullName.trim())}</strong>,</p>

      <p style="margin: 0 0 14px;">
        Vă mulțumim! Formularul de înscriere a fost trimis și înregistrat cu succes.
      </p>

      <p style="margin: 0 0 14px;">${childrenText(payload)}</p>

      <p style="margin: 0 0 8px;"><strong>Date de contact:</strong></p>
      <p style="margin: 0 0 4px;"><strong>Email:</strong> ${escapeHtml(payload.parent.email.trim())}</p>
      ${phoneLine}

      <p style="margin: 18px 0 8px;"><strong>Consimțământ:</strong></p>
      <ul style="margin: 0 0 14px; padding-left: 20px;">
        <li>Politica de Confidențialitate și Termenii și Condițiile — <strong>acceptat</strong></li>
        <li>Luare la cunoștință — apariție în fotografii și clipuri video la eveniment — <strong>${payload.consent.mediaAccepted ? 'Da' : 'Nu'}</strong></li>
        <li>Informări despre activități viitoare — <strong>${payload.consent.marketingAccepted ? 'Da' : 'Nu'}</strong></li>
      </ul>

      <p style="margin: 0 0 8px;"><strong>Politica de Confidențialitate</strong></p>
      <p style="margin: 0 0 14px;">${escapeHtml(PRIVACY_POLICY_TEXT)}</p>

      <p style="margin: 0 0 8px;"><strong>Termenii și Condițiile</strong></p>
      <p style="margin: 0 0 14px;">${escapeHtml(TERMS_TEXT)}</p>
    </div>
  `
}

function buildPdfPage2Html(payload: FormPayload): string {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #1a2332; font-size: 14px; line-height: 1.55; background: #ffffff; padding: 8px;">
      <p style="margin: 0 0 14px;">
        Prin semnătura de mai jos confirmați că ați citit Politica de
        Confidențialitate, Termenii și Condițiile și că ați luat la cunoștință
        informările privind apariția în fotografii și clipuri video.
      </p>

      <p style="margin: 0 0 8px;"><strong>Data:</strong> ${escapeHtml(formatDateRo())}</p>

      <p style="margin: 16px 0 8px;"><strong>Semnătură:</strong></p>
      <img src="${payload.signature}" alt="Semnătură" width="280" style="display: block; max-width: 280px; height: auto; border: 1px solid #dce3eb; border-radius: 8px;" />
    </div>
  `
}

function waitForImage(img: HTMLImageElement): Promise<void> {
  if (img.complete && img.naturalWidth > 0) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('Semnătura nu a putut fi inclusă în PDF.'))
  })
}

function waitForPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
}

function signatureFormat(dataUrl: string): 'PNG' | 'JPEG' {
  return dataUrl.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG'
}

async function renderHtmlCanvas(html: string): Promise<HTMLCanvasElement> {
  const wrapper = document.createElement('div')
  wrapper.style.position = 'fixed'
  wrapper.style.left = '0'
  wrapper.style.top = '0'
  wrapper.style.width = '794px'
  wrapper.style.padding = '0'
  wrapper.style.margin = '0'
  wrapper.style.background = '#ffffff'
  wrapper.style.pointerEvents = 'none'
  wrapper.style.transform = 'translateX(-200vw)'
  wrapper.innerHTML = html
  document.body.appendChild(wrapper)

  try {
    const img = wrapper.querySelector('img')
    if (img instanceof HTMLImageElement) {
      await waitForImage(img)
    }

    await waitForPaint()

    const scale = window.innerWidth < 768 ? 1 : 2
    const canvas = await html2canvas(wrapper, {
      scale,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    })

    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('PDF-ul nu a putut fi generat.')
    }

    return canvas
  } finally {
    document.body.removeChild(wrapper)
  }
}

function appendCanvasToSinglePage(
  doc: {
    internal: { pageSize: { getWidth(): number; getHeight(): number } }
    addImage: (
      imageData: string,
      format: string,
      x: number,
      y: number,
      w: number,
      h: number,
    ) => void
  },
  canvas: HTMLCanvasElement,
  margin: number,
): void {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const maxWidth = pageWidth - margin * 2
  const maxHeight = pageHeight - margin * 2

  let contentWidth = maxWidth
  let imgHeight = (canvas.height * contentWidth) / canvas.width

  if (imgHeight > maxHeight) {
    imgHeight = maxHeight
    contentWidth = (canvas.width * imgHeight) / canvas.height
  }

  doc.addImage(
    canvas.toDataURL('image/png'),
    'PNG',
    margin,
    margin,
    contentWidth,
    imgHeight,
  )
}

async function buildPdfFromCanvas(payload: FormPayload): Promise<EnrollmentPdfFile> {
  const canvas1 = await renderHtmlCanvas(buildPdfPage1Html(payload))
  const canvas2 = await renderHtmlCanvas(buildPdfPage2Html(payload))

  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' })
  const margin = 40

  appendCanvasToSinglePage(doc, canvas1, margin)

  doc.addPage()

  appendCanvasToSinglePage(doc, canvas2, margin)

  return {
    blob: doc.output('blob'),
    fileName: buildFileName(payload),
  }
}

async function buildPdfNative(payload: FormPayload): Promise<EnrollmentPdfFile> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' })

  const margin = 50
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const maxWidth = pageWidth - margin * 2
  let y = 56

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage()
      y = margin
    }
  }

  const writeLines = (
    text: string,
    options: { size?: number; bold?: boolean; gapAfter?: number } = {},
  ) => {
    const size = options.size ?? 11
    const gapAfter = options.gapAfter ?? 14
    const lineHeight = size * 1.35

    doc.setFontSize(size)
    doc.setFont('helvetica', options.bold ? 'bold' : 'normal')

    const lines = doc.splitTextToSize(text, maxWidth) as string[]
    ensureSpace(lines.length * lineHeight + gapAfter)

    for (const line of lines) {
      doc.text(line, margin, y)
      y += lineHeight
    }

    y += gapAfter - lineHeight
  }

  writeLines('Confirmare inscriere', { size: 18, bold: true, gapAfter: 22 })
  writeLines(`Draga parinte ${payload.parent.fullName.trim()},`, { gapAfter: 14 })
  writeLines(
    'Va multumim! Formularul de inscriere a fost trimis si inregistrat cu succes.',
    { gapAfter: 14 },
  )

  if (payload.children.length === 1) {
    const child = payload.children[0]
    writeLines(
      `Va confirmam inscrierea copilului ${child.fullName}, in varsta de ${child.age} ani.`,
      { gapAfter: 14 },
    )
  } else {
    writeLines('Va confirmam inscrierea urmatorilor copii:', { gapAfter: 8 })
    for (const child of payload.children) {
      writeLines(`- ${child.fullName} — ${child.age} ani`, { gapAfter: 6 })
    }
    y += 8
  }

  writeLines('Date de contact:', { bold: true, gapAfter: 8 })
  writeLines(`Email: ${payload.parent.email.trim()}`, { gapAfter: 6 })

  if (payload.parent.phone.trim()) {
    writeLines(`Telefon: ${payload.parent.phone.trim()}`, { gapAfter: 14 })
  } else {
    y += 4
  }

  writeLines('Consimtamant:', { bold: true, gapAfter: 8 })
  writeLines(
    'Politica de Confidentialitate si Termenii si Conditiile — acceptat',
    { gapAfter: 6 },
  )
  writeLines(
    `Luare la cunoștință — apariție în fotografii și clipuri video la eveniment — ${payload.consent.mediaAccepted ? 'Da' : 'Nu'}`,
    { gapAfter: 6 },
  )
  writeLines(
    `Informatari despre activitati viitoare — ${payload.consent.marketingAccepted ? 'Da' : 'Nu'}`,
    { gapAfter: 14 },
  )

  writeLines('Politica de Confidentialitate', { bold: true, gapAfter: 8 })
  writeLines(PRIVACY_POLICY_TEXT, { gapAfter: 14 })

  writeLines('Termenii si Conditiile', { bold: true, gapAfter: 8 })
  writeLines(TERMS_TEXT, { gapAfter: 14 })

  doc.addPage()
  y = margin

  writeLines(
    'Prin semnatura de mai jos confirmati ca ati citit Politica de Confidentialitate, Termenii si Conditiile si ca ati luat la cunoștință informatiile privind aparitia in fotografii si clipuri video.',
    { gapAfter: 14 },
  )

  writeLines(`Data: ${formatDateRo()}`, { gapAfter: 16 })
  writeLines('Semnatura:', { bold: true, gapAfter: 10 })

  if (payload.signature) {
    const imgProps = doc.getImageProperties(payload.signature)
    const imgWidth = 220
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width

    ensureSpace(imgHeight + 20)
    doc.addImage(
      payload.signature,
      signatureFormat(payload.signature),
      margin,
      y,
      imgWidth,
      imgHeight,
    )
  }

  return {
    blob: doc.output('blob'),
    fileName: buildFileName(payload),
  }
}

export async function buildEnrollmentPdf(
  payload: FormPayload,
): Promise<EnrollmentPdfFile> {
  try {
    return await buildPdfFromCanvas(payload)
  } catch {
    return buildPdfNative(payload)
  }
}

export async function triggerPdfDownload({ blob, fileName }: EnrollmentPdfFile): Promise<void> {
  const file = new File([blob], fileName, { type: 'application/pdf' })

  if (typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'Confirmare inscriere',
      })
      return
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }
    }
  }

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.type = 'application/pdf'
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  window.setTimeout(() => URL.revokeObjectURL(url), 120_000)
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

export async function downloadEnrollmentPdf(payload: FormPayload): Promise<EnrollmentPdfFile> {
  const pdf = await buildEnrollmentPdf(payload)
  await triggerPdfDownload(pdf)
  return pdf
}
