import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  clearAdminToken,
  fetchSubmissions,
  getAdminToken,
  setAdminToken,
  type SavedSubmission,
} from '../api/submissions'
import '../App.css'

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ro-RO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function AdminPage() {
  const [password, setPassword] = useState('')
  const [token, setToken] = useState<string | null>(() => getAdminToken())
  const [submissions, setSubmissions] = useState<SavedSubmission[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSubmissions = async (adminPassword: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchSubmissions(adminPassword)
      setSubmissions(data)
    } catch (loadError) {
      clearAdminToken()
      setToken(null)
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Nu s-au putut încărca înscrierile.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      void loadSubmissions(token)
    }
  }, [token])

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!password.trim()) return
    setAdminToken(password.trim())
    setToken(password.trim())
    setPassword('')
  }

  const handleLogout = () => {
    clearAdminToken()
    setToken(null)
    setSubmissions([])
    setError(null)
  }

  if (!token) {
    return (
      <div className="page">
        <main className="form-card">
          <header className="form-header">
            <h1>Administrare înscrieri</h1>
          </header>

          {error && (
            <div className="error-banner" role="alert">
              <strong>Eroare</strong>
              <p>{error}</p>
            </div>
          )}

          <form className="enrollment-form" onSubmit={handleLogin}>
            <div className="field">
              <label htmlFor="admin-password">Parolă admin</label>
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introduceți parola"
              />
            </div>
            <footer className="form-footer">
              <button type="submit" className="btn-primary">
                Accesează
              </button>
              <p className="form-nav">
                <Link to="/">Înapoi la formular</Link>
              </p>
            </footer>
          </form>
        </main>
      </div>
    )
  }

  return (
    <div className="page">
      <main className="form-card admin-card">
        <header className="form-header admin-header">
          <div>
            <h1>Înscrieri salvate</h1>
            <p className="admin-count">
              {loading
                ? 'Se încarcă...'
                : `${submissions.length} înscrieri în total`}
            </p>
          </div>
          <button type="button" className="btn-text btn-logout" onClick={handleLogout}>
            Deconectare
          </button>
        </header>

        {error && (
          <div className="error-banner" role="alert">
            <strong>Eroare</strong>
            <p>{error}</p>
          </div>
        )}

        {!loading && submissions.length === 0 && (
          <p className="empty-state">Nu există înscrieri salvate încă.</p>
        )}

        <div className="submissions-list">
          {submissions.map((submission) => (
            <article key={submission.id} className="submission-card">
              <header className="submission-header">
                <strong>#{submission.id}</strong>
                <span>{formatDate(submission.createdAt)}</span>
              </header>
              <div className="submission-body">
                <p>
                  <span className="label">Părinte:</span> {submission.parentFullName}
                </p>
                <p>
                  <span className="label">Email:</span> {submission.parentEmail}
                </p>
                {submission.parentPhone && (
                  <p>
                    <span className="label">Telefon:</span> {submission.parentPhone}
                  </p>
                )}
                <div className="submission-children">
                  <span className="label">Copii:</span>
                  <ul>
                    {submission.children.map((child) => (
                      <li key={child.id}>
                        {child.fullName} — {child.age} ani
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="form-nav">
          <Link to="/">Înapoi la formular</Link>
        </p>
      </main>
    </div>
  )
}
