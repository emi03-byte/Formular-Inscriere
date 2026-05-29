import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { initDb } from './db.js'
import { submissionsRouter } from './routes/submissions.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const port = Number(process.env.PORT) || 3001
const isProduction = process.env.NODE_ENV === 'production'

app.use(express.json({ limit: '6mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/submissions', submissionsRouter)

if (isProduction) {
  const distPath = path.join(__dirname, '../../dist')
  app.use(express.static(distPath))
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

await initDb()

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
