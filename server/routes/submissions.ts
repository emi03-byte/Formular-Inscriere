import { Router } from 'express'
import type { FormPayload } from '../types.js'
import { requireAdmin } from '../auth.js'
import { createSubmission, listSubmissions } from '../db.js'
import { parsePdfAttachment, sendEnrollmentEmails } from '../email.js'

export const submissionsRouter = Router()

submissionsRouter.post('/', async (req, res) => {
  try {
    const payload = req.body as FormPayload

    if (payload.pdfBase64) {
      parsePdfAttachment(payload.pdfBase64, 'confirmare-inscriere.pdf')
    }

    const result = await createSubmission(payload)

    try {
      await sendEnrollmentEmails(payload, result.id, result.createdAt)
    } catch (emailError) {
      console.error('Trimiterea emailurilor a eșuat:', emailError)
    }

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
