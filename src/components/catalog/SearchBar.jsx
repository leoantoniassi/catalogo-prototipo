import { Icon } from '../ui/Icon.jsx'

export function SearchBar({ value, onChange }) {
  return (
    <div className="search-field">
      <Icon name="search" size={18} />
      <input
        type="search"
        className="search-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar por nome ou descrição..."
        aria-label="Buscar produtos"
      />
      {value ? (
        <button
          type="button"
          className="search-clear"
          onClick={() => onChange('')}
          aria-label="Limpar busca"
        >
          <Icon name="close" size={15} />
        </button>
      ) : null}
    </div>
  )
}
