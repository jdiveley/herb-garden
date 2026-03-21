import React, { useState, useEffect } from 'react'

export default function HeroEditor({ data, onSave, saving }) {
  const [form, setForm] = useState(data)
  useEffect(() => setForm(data), [data])
  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  return (
    <div className="admin-editor">
      <div className="admin-section-header">
        <div>
          <h2>Homepage Text</h2>
          <p>Edit the hero section at the top of your site.</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={() => onSave(form)} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-field">
          <label>Location tagline <span>(shown above the title)</span></label>
          <input value={form.eyebrow} onChange={set('eyebrow')} placeholder="e.g. Narangba, QLD · Est. 2025" />
        </div>
        <div className="admin-field">
          <label>Title — first line</label>
          <input value={form.title} onChange={set('title')} placeholder="e.g. Fresh herbs," />
        </div>
        <div className="admin-field">
          <label>Title — emphasis line <span>(shown in italic green)</span></label>
          <input value={form.titleEmphasis} onChange={set('titleEmphasis')} placeholder="e.g. free for neighbors" />
        </div>
        <div className="admin-field">
          <label>Description paragraph</label>
          <textarea rows={4} value={form.description} onChange={set('description')} />
        </div>
      </div>

      <div className="admin-preview">
        <p className="admin-preview__label">Preview</p>
        <div className="admin-preview__box">
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6a8a5e', marginBottom: '0.5rem' }}>{form.eyebrow}</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', lineHeight: 1.2, marginBottom: '0.75rem' }}>
            {form.title}<br /><em style={{ color: '#3d5a36' }}>{form.titleEmphasis}</em>
          </h2>
          <p style={{ color: '#6b4f35', fontSize: '1rem', lineHeight: 1.7 }}>{form.description}</p>
        </div>
      </div>
    </div>
  )
}
