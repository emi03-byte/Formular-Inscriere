import type { ChildData } from '../types'

type ChildBlockProps = {
  child: ChildData
  index: number
  canRemove: boolean
  onChange: (id: string, field: keyof Omit<ChildData, 'id'>, value: string) => void
  onRemove: (id: string) => void
}

export function ChildBlock({
  child,
  index,
  canRemove,
  onChange,
  onRemove,
}: ChildBlockProps) {
  const nameId = `child-name-${child.id}`
  const ageId = `child-age-${child.id}`

  return (
    <article className="child-card" aria-labelledby={`child-heading-${child.id}`}>
      <header className="child-card-header">
        <h3 id={`child-heading-${child.id}`} className="child-card-title">
          Copil {index + 1}
        </h3>
        {canRemove && (
          <button
            type="button"
            className="btn-text btn-remove"
            onClick={() => onRemove(child.id)}
            aria-label={`Elimină copilul ${index + 1}`}
          >
            Elimină
          </button>
        )}
      </header>

      <div className="field">
        <label htmlFor={nameId}>Nume și prenume</label>
        <input
          id={nameId}
          name={nameId}
          type="text"
          required
          placeholder="ex. Andrei Popescu"
          value={child.fullName}
          onChange={(e) => onChange(child.id, 'fullName', e.target.value)}
        />
      </div>

      <div className="field field-age">
        <label htmlFor={ageId}>Vârstă</label>
        <input
          id={ageId}
          name={ageId}
          type="number"
          required
          min={1}
          max={18}
          placeholder="ex. 8"
          value={child.age}
          onChange={(e) => onChange(child.id, 'age', e.target.value)}
        />
      </div>
    </article>
  )
}
