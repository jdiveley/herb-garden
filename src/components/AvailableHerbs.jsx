import React, { useState } from 'react'
import './AvailableHerbs.css'

const STATUS_LABELS = {
  available:     { label: 'Available',    color: 'var(--moss)' },
  limited:       { label: 'Limited',      color: '#b36a00' },
  'coming-soon': { label: 'Coming soon',  color: 'var(--sage)' },
  gone:          { label: 'Gone for now', color: 'var(--dust)' },
}

export default function AvailableHerbs({ herbs = [], orchard = [] }) {
  const [view, setView] = useState('herbs')
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)

  const items = view === 'herbs' ? herbs : orchard
  const filters = ['all', 'available', 'limited', 'coming-soon']
  const visible = items.filter(h => filter === 'all' ? true : h.status === filter)

  const switchView = (v) => {
    setView(v)
    setFilter('all')
    setExpanded(null)
  }

  return (
    <section id="herbs" className="herbs">
      <div className="herbs__header">
        <p className="section-label">From the garden</p>
        <h2 className="herbs__title">What's Growing</h2>
        <p className="herbs__subtitle">
          Updated as the garden changes. Everything here is grown without pesticides,
          picked fresh the day you come by.
        </p>
      </div>

      <div className="herbs__toggle">
        <button
          className={`herbs__toggle-btn ${view === 'herbs' ? 'active' : ''}`}
          onClick={() => switchView('herbs')}
        >Herb Garden</button>
        <button
          className={`herbs__toggle-btn ${view === 'orchard' ? 'active' : ''}`}
          onClick={() => switchView('orchard')}
        >Orchard</button>
      </div>

      <div className="herbs__filters">
        {filters.map(f => (
          <button
            key={f}
            className={`herbs__filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all'
              ? (view === 'herbs' ? 'All herbs' : 'All fruit')
              : STATUS_LABELS[f]?.label}
          </button>
        ))}
      </div>

      <div className="herbs__grid">
        {visible.map(item => (
          <article
            key={item.id}
            className={`herb-card herb-card--${item.status} ${expanded === item.id ? 'herb-card--expanded' : ''}`}
            onClick={() => setExpanded(expanded === item.id ? null : item.id)}
          >
            <div className="herb-card__top">
              <span className="herb-card__emoji">{item.emoji}</span>
              <div className="herb-card__meta">
                <span className="herb-card__status" style={{ color: STATUS_LABELS[item.status]?.color }}>
                  {STATUS_LABELS[item.status]?.label}
                </span>
                <h3 className="herb-card__name">{item.name}</h3>
                <p className="herb-card__qty">{item.quantity}</p>
              </div>
              <span className="herb-card__arrow">{expanded === item.id ? '−' : '+'}</span>
            </div>
            {expanded === item.id && (
              <div className="herb-card__details">
                <p className="herb-card__desc">{item.description}</p>
                <p className="herb-card__tip"><strong>Tip:</strong> {item.tip}</p>
                {(item.status === 'available' || item.status === 'limited') && (
                  <a href="#contact" className="herb-card__claim">Claim some →</a>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
