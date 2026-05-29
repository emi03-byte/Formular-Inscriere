import { Link } from 'react-router-dom'
import '../App.css'

type LegalDocumentPageProps = {
  title: string
  text: string
}

export function LegalDocumentPage({ title, text }: LegalDocumentPageProps) {
  return (
    <div className="page">
      <main className="form-card legal-doc-card">
        <header className="form-header">
          <h1>{title}</h1>
        </header>

        <div className="legal-doc-content">
          <p>{text}</p>
        </div>

        <p className="form-nav">
          <Link to="/">Înapoi la formular</Link>
        </p>
      </main>
    </div>
  )
}
