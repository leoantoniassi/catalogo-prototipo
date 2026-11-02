import { SORT_OPTIONS } from '../../lib/catalog.js'
import { Icon } from '../ui/Icon.jsx'

export function SortSelect({ value, onChange }) {
  return (
    <label className="sort-field">
      Ordenar
      <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
        <select
          className="select"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          style={{ paddingRight: 34, appearance: 'none' }}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon
          name="chevronDown"
          size={16}
          style={{ position: 'absolute', right: 11, pointerEvents: 'none', color: 'var(--text-muted)' }}
        />
      </span>
    </label>
  )
}
