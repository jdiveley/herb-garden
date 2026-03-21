import React, { useState, useEffect } from 'react'

export default function StatsEditor({ data, onSave, saving }) {
  const [stats, setStats] = useState(data)
  useEffect(() => setStats(data), [data])

  const update = (id, field, value) => {
    setStats(s => s.map(stat => stat.id === id ? { ...stat, [field]: value } : stat))
  }

  return (
    <div className="admin-editor">
      <div className="admin-section-header">
        <div>
          <h2>Garden Stats</h2>
          <p>Edit the four stat boxes shown in the About section.</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={() => onSave(stats)} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="admin-card">
        <div className="stats-editor__grid">
          {stats.map(stat => (
            <div key={stat.id} className="stats-editor__item">
              <div className="stats-editor__preview">
                <span className="stats-editor__num">{stat.value}</span>
                <span className="stats-editor__label">{stat.label}</span>
              </div>
              <div className="admin-field">
                <label>Value</label>
                <input
                  value={stat.value}
                  onChange={e => update(stat.id, 'value', e.target.value)}
                  placeholder="e.g. 6+, 20+, 0, ∞"
                />
              </div>
              <div className="admin-field">
                <label>Label</label>
                <input
                  value={stat.label}
                  onChange={e => update(stat.id, 'label', e.target.value)}
                  placeholder="e.g. Years growing"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-preview">
        <p className="admin-preview__label">Preview</p>
        <div className="admin-preview__box">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#e0d8c8', border: '1px solid #e0d8c8', borderRadius: '4px', overflow: 'hidden', maxWidth: '300px' }}>
            {stats.map(stat => (
              <div key={stat.id} style={{ background: '#f5f0e8', padding: '1.2rem' }}>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 600, color: '#3d5a36', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontFamily: 'Raleway, sans-serif', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a89880', marginTop: '0.3rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
