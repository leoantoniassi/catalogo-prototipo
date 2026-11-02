export function CategoryFilter({ categories, activeId, onChange }) {
  return (
    <div className="category-chips" role="group" aria-label="Filtrar por categoria">
      <button
        type="button"
        className={`chip ${activeId === 'all' ? 'is-active' : ''}`}
        onClick={() => onChange('all')}
        aria-pressed={activeId === 'all'}
      >
        Todos
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          className={`chip ${activeId === category.id ? 'is-active' : ''}`}
          onClick={() => onChange(category.id)}
          aria-pressed={activeId === category.id}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}
