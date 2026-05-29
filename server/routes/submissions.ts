import { Router } from 'express'
import type { FormPayload } from '../../src/types.js'
import { requireAdmin } from '../auth.js'
import { createSubmission, listSubmissions } from '../db.js'

export const submissionsRouter = Router()

submissionsRouter.post('/', async (req, res) => {
  try {
    const payload = req.body as FormPayload
    const result = await createSubmission(payload)
    res.status(201).json(result)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Eroare la salvarea înscrierii.'
    res.status(400).json({ error: message })
  }
})

submissionsRouter.get('/', requireAdmin, async (_req, res) => {
  try {
    const submissions = await listSubmissions()
    res.json(submissions)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Eroare la citirea înscrierilor.'
    res.status(500).json({ error: message })
  }
})
