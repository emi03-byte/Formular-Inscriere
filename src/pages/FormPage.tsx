import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { submitEnrollment } from '../api/submissions'
import { ChildrenSection } from '../components/ChildrenSection'
import { ParentSection } from '../components/ParentSection'
import {
  createChild,
  emptyParent,
  type ChildData,
  type FormPayload,
  type ParentData,
} from '../types'
import '../App.css'

export function FormPage() {
  const [parent, setParent] = useState<ParentData>(emptyParent)
  const [children, setChildren] = useState<ChildData[]>([createChild()])
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateParent = (field: keyof ParentData, value: string) => {
    setParent((prev) => ({ ...prev, [field]: value }))
    setSubmitted(false)
    setError(null)
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
    setSubmitted(false)
    setError(null)
  }

  const addChild = () => {
    setChildren((prev) => [...prev, createChild()])
    setSubmitted(false)
    setError(null)
  }

  const removeChild = (id: string) => {
    setChildren((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((child) => child.id !== id)
    })
    setSubmitted(false)
    setError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    const payload: FormPayload = { parent, children }
    setIsSubmitting(true)
    setError(null)

    try {
      await submitEnrollment(payload)
      setParent(emptyParent())
      setChildren([createChild()])
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
            <strong>Înscrierea a fost înregistrată!</strong>
            <p>Datele au fost salvate cu succes. Puteți completa o nouă înscriere.</p>
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
