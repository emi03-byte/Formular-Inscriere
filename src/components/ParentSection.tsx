import type { ParentData } from '../types'

type ParentSectionProps = {
  data: ParentData
  onChange: (field: keyof ParentData, value: string) => void
}

export function ParentSection({ data, onChange }: ParentSectionProps) {
  return (
    <section className="form-section" aria-labelledby="parent-heading">
      <h2 id="parent-heading" className="section-title">
        Date părinte
      </h2>
      <p className="section-desc">
        Informațiile de contact ale părintelui sau tutorelui legal.
      </p>

      <div className="field">
        <label htmlFor="parent-fullName">Nume și prenume</label>
        <input
          id="parent-fullName"
          name="parent-fullName"
          type="text"
          autoComplete="name"
          required
          placeholder="ex. Maria Popescu"
          value={data.fullName}
          onChange={(e) => onChange('fullName', e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="parent-email">Email</label>
        <input
          id="parent-email"
          name="parent-email"
          type="email"
          autoComplete="email"
          required
          placeholder="ex. maria@email.com"
          value={data.email}
          onChange={(e) => onChange('email', e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="parent-phone">
          Număr de telefon{' '}
          <span className="optional">(opțional)</span>
        </label>
        <input
          id="parent-phone"
          name="parent-phone"
          type="tel"
          autoComplete="tel"
          placeholder="ex. 07xx xxx xxx"
          value={data.phone}
          onChange={(e) => onChange('phone', e.target.value)}
        />
      </div>
    </section>
  )
}
