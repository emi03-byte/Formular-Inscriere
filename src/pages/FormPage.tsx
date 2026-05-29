import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { submitEnrollment } from '../api/submissions'
import { ChildrenSection } from '../components/ChildrenSection'
import { ConsentSection } from '../components/ConsentSection'
import { ParentSection } from '../components/ParentSection'
import { SignatureSection } from '../components/SignatureSection'
import {
  createChild,
  emptyConsent,
  emptyParent,
  type ChildData,
  type ConsentData,
  type FormPayload,
  type ParentData,
} from '../types'
import { buildEnrollmentPdf, blobToBase64 } from '../utils/generateEnrollmentPdf'
import '../App.css'

export function FormPage() {
  const [parent, setParent] = useState<ParentData>(emptyParent)
  const [children, setChildren] = useState<ChildData[]>([createChild()])
  const [consent, setConsent] = useState<ConsentData>(emptyConsent)
  const [signature, setSignature] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearFeedback = () => {
    setSubmitted(false)
    setError(null)
  }

  const updateParent = (field: keyof ParentData, value: string) => {
    setParent((prev) => ({ ...prev, [field]: value }))
    clearFeedback()
  }

  const updateChild = (
    id: string,
    field: keyof Omit<ChildData, 'id'>,
    value: string,
  ) => {
    setChildren((prev) =>
      prev.map((child) =>
        child.id === id ? { ...child, [field]: value } : child,
      ),
    )
    clearFeedback()
  }

  const updateConsent = (field: keyof ConsentData, value: boolean) => {
    setConsent((prev) => ({ ...prev, [field]: value }))
    clearFeedback()
  }

  const addChild = () => {
    setChildren((prev) => [...prev, createChild()])
    clearFeedback()
  }

  const removeChild = (id: string) => {
    setChildren((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((child) => child.id !== id)
    })
    clearFeedback()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    if (!signature) {
      setError('Semnătura este obligatorie.')
      return
    }

    const payload: FormPayload = { parent, children, consent, signature }
    setIsSubmitting(true)
    setError(null)

    try {
      const pdf = await buildEnrollmentPdf(payload)
      const pdfBase64 = await blobToBase64(pdf.blob)

      await submitEnrollment({ ...payload, pdfBase64 })

      setParent(emptyParent())
      setChildren([createChild()])
      setConsent(emptyConsent())
      setSignature('')
      setSubmitted(true)
      form.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Nu s-a putut salva înscrierea.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page">
      <main className="form-card">
        <header className="form-header">
          <h1>Formular de înscriere</h1>
        </header>

        {submitted && (
          <div className="success-banner" role="status">
            <strong>Înscrierea dumneavoastră a fost înregistrată.</strong>
          </div>
        )}

        {error && (
          <div className="error-banner" role="alert">
            <strong>Eroare</strong>
            <p>{error}</p>
          </div>
        )}

        <form className="enrollment-form" onSubmit={handleSubmit}>
          <ParentSection data={parent} onChange={updateParent} />

          <div className="section-divider" role="separator" aria-hidden="true" />

          <ChildrenSection
            children={children}
            onChange={updateChild}
            onAdd={addChild}
            onRemove={removeChild}
          />

          <div className="section-divider" role="separator" aria-hidden="true" />

          <ConsentSection data={consent} onChange={updateConsent} />

          <div className="section-divider" role="separator" aria-hidden="true" />

          <SignatureSection value={signature} onChange={setSignature} />

          <footer className="form-footer">
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Se trimite...' : 'Trimite înscrierea'}
            </button>
            <p className="form-nav">
              <Link to="/admin">Vezi înscrieri</Link>
            </p>
          </footer>
        </form>
      </main>
    </div>
  )
}
