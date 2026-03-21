import React, { useState } from 'react'
import './AvailableHerbs.css'

const STATUS_LABELS = {
  available:     { label: 'Available',    color: 'var(--moss)' },
  limited:       { label: 'Limited',      color: '#b36a00' },
  'coming-soon': { label: 'Coming soon',  color: 'var(--sage)' },
  gone:          { label: 'Gone for now', color: 'var(--dust)' },
}

export default function AvailableHerbs({ herbs = [] }) {
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)

  const filters = ['all', 'available', 'limited', 'coming-soon']
  const visible = herbs.filter(h => filter === 'all' ? true : h.status === filter)

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

      <div className="herbs__filters">
        {filters.map(f => (
          <button
            key={f}
            className={`herbs__filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All herbs' : STATUS_LABELS[f]?.label}
          </button>
        ))}
      </div>

      <div className="herbs__grid">
        {visible.map(herb => (
          <article
            key={herb.id}
            className={`herb-card herb-card--${herb.status} ${expanded === herb.id ? 'herb-card--expanded' : ''}`}
            onClick={() => setExpanded(expanded === herb.id ? null : herb.id)}
          >
            <div className="herb-card__top">
              <span className="herb-card__emoji">{herb.emoji}</span>
              <div className="herb-card__meta">
                <span className="herb-card__status" style={{ color: STATUS_LABELS[herb.status]?.color }}>
                  {STATUS_LABELS[herb.status]?.label}
                </span>
                <h3 className="herb-card__name">{herb.name}</h3>
                <p className="herb-card__qty">{herb.quantity}</p>
              </div>
              <span className="herb-card__arrow">{expanded === herb.id ? '−' : '+'}</span>
            </div>
            {expanded === herb.id && (
              <div className="herb-card__details">
                <p className="herb-card__desc">{herb.description}</p>
                <p className="herb-card__tip"><strong>Harvesting tip:</strong> {herb.tip}</p>
                {(herb.status === 'available' || herb.status === 'limited') && (
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
