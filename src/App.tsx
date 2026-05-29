import { Route, Routes } from 'react-router-dom'
import { AdminPage } from './pages/AdminPage'
import { FormPage } from './pages/FormPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<FormPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  )
}

export default App
