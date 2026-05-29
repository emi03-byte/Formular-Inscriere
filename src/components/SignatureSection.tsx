import { useEffect, useRef } from 'react'

type SignatureSectionProps = {
  value: string
  onChange: (value: string) => void
}

function applyCanvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.strokeStyle = '#1a2332'
  ctx.lineWidth = window.matchMedia('(max-width: 480px)').matches ? 2.5 : 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  return ctx
}

function restoreSignature(canvas: HTMLCanvasElement, dataUrl: string): void {
  const ctx = applyCanvasContext(canvas)
  if (!ctx) return

  const img = new Image()
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  }
  img.src = dataUrl
}

export function SignatureSection({ value, onChange }: SignatureSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const valueRef = useRef(value)

  useEffect(() => {
    valueRef.current = value
  }, [value])

  const syncSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    onChange(canvas.toDataURL('image/png'))
  }

  const getPoint = (
    event: React.MouseEvent | React.TouchEvent,
  ): { x: number; y: number } | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ('touches' in event) {
      const touch = event.touches[0] ?? event.changedTouches[0]
      if (!touch) return null
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    }

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    }
  }

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault()
    const canvas = canvasRef.current
    const point = getPoint(event)
    if (!canvas || !point) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    drawingRef.current = true
    ctx.beginPath()
    ctx.moveTo(point.x, point.y)
  }

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!drawingRef.current) return
    event.preventDefault()

    const canvas = canvasRef.current
    const point = getPoint(event)
    if (!canvas || !point) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.lineTo(point.x, point.y)
    ctx.stroke()
  }

  const stopDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    if (!drawingRef.current) return
    event.preventDefault()
    drawingRef.current = false
    syncSignature()
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    onChange('')
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return

      const saved = valueRef.current
      canvas.width = Math.max(1, Math.round(rect.width))
      canvas.height = Math.max(1, Math.round(rect.height))

      applyCanvasContext(canvas)

      if (saved) {
        restoreSignature(canvas, saved)
      }
    }

    resizeCanvas()
    const observer = new ResizeObserver(resizeCanvas)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (value) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }, [value])

  return (
    <section className="form-section" aria-labelledby="signature-heading">
      <h2 id="signature-heading" className="section-title">
        Semnătură
      </h2>

      <div className="signature-wrap">
        <canvas
          ref={canvasRef}
          className="signature-canvas"
          aria-label="Desenați semnătura aici"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        <button
          type="button"
          className="btn-text btn-clear-signature"
          onClick={clearSignature}
        >
          Șterge semnătura
        </button>
      </div>
    </section>
  )
}
