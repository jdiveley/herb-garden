import React, { useState, useEffect } from 'react'

export default function AboutEditor({ data, onSave, saving }) {
  const [form, setForm] = useState(data)
  useEffect(() => setForm(data), [data])
  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  return (
    <div className="admin-editor">
      <div className="admin-section-header">
        <div>
          <h2>About Section</h2>
          <p>Edit the story paragraphs shown on your about section.</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={() => onSave(form)} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-field">
          <label>First paragraph</label>
          <textarea rows={3} value={form.paragraph1} onChange={set('paragraph1')} />
        </div>
        <div className="admin-field">
          <label>Second paragraph</label>
          <textarea rows={3} value={form.paragraph2} onChange={set('paragraph2')} />
        </div>
        <div className="admin-field">
          <label>Third paragraph</label>
          <textarea rows={3} value={form.paragraph3} onChange={set('paragraph3')} />
        </div>
        <div className="admin-field">
          <label>Signature <span>(shown as italic sign-off)</span></label>
          <input value={form.signature} onChange={set('signature')} placeholder="e.g. The gardeners at Blackpaw Cottage" />
        </div>
      </div>

      <div className="admin-preview">
        <p className="admin-preview__label">Preview</p>
        <div className="admin-preview__box">
          {[form.paragraph1, form.paragraph2, form.paragraph3].map((p, i) => (
            <p key={i} style={{ color: '#6b4f35', fontSize: '1rem', lineHeight: 1.85, marginBottom: '1rem' }}>{p}</p>
          ))}
          <p style={{ color: '#6a8a5e', fontStyle: 'italic', fontSize: '0.95rem' }}>
            — <em>{form.signature}</em>
          </p>
        </div>
      </div>
    </div>
  )
}
