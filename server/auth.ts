import type { Request, Response, NextFunction } from 'express'

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const password = process.env.ADMIN_PASSWORD

  if (!password) {
    res.status(503).json({ error: 'Parola admin nu este configurată.' })
    return
  }

  const auth = req.headers.authorization
  if (auth !== `Bearer ${password}`) {
    res.status(401).json({ error: 'Neautorizat.' })
    return
  }

  next()
}
