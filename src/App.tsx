import { Route, Routes } from 'react-router-dom'
import {
  PRIVACY_POLICY_TEXT,
  PRIVACY_POLICY_TITLE,
  TERMS_TEXT,
  TERMS_TITLE,
} from './content/legalTexts'
import { AdminPage } from './pages/AdminPage'
import { FormPage } from './pages/FormPage'
import { LegalDocumentPage } from './pages/LegalDocumentPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<FormPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route
        path="/politica-de-confidentialitate"
        element={
          <LegalDocumentPage title={PRIVACY_POLICY_TITLE} text={PRIVACY_POLICY_TEXT} />
        }
      />
      <Route
        path="/termeni-si-conditii"
        element={<LegalDocumentPage title={TERMS_TITLE} text={TERMS_TEXT} />}
      />
    </Routes>
  )
}

export default App
