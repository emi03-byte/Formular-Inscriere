import type { ChildData } from '../types'
import { ChildBlock } from './ChildBlock'

type ChildrenSectionProps = {
  children: ChildData[]
  onChange: (id: string, field: keyof Omit<ChildData, 'id'>, value: string) => void
  onAdd: () => void
  onRemove: (id: string) => void
}

export function ChildrenSection({
  children,
  onChange,
  onAdd,
  onRemove,
}: ChildrenSectionProps) {
  const canRemove = children.length > 1

  return (
    <section className="form-section" aria-labelledby="children-heading">
      <h2 id="children-heading" className="section-title">
        Date copii
      </h2>

      <div className="children-list">
        {children.map((child, index) => (
          <ChildBlock
            key={child.id}
            child={child}
            index={index}
            canRemove={canRemove}
            onChange={onChange}
            onRemove={onRemove}
          />
        ))}
      </div>

      <button type="button" className="btn-secondary btn-add-child" onClick={onAdd}>
        <span className="btn-icon" aria-hidden="true">
          +
        </span>
        Adaugă copil
      </button>
    </section>
  )
}
