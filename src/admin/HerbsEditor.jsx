import React, { useState } from 'react'

const STATUSES = ['available', 'limited', 'coming-soon', 'gone']
const STATUS_COLORS = {
  available:     '#3d5a36',
  limited:       '#b36a00',
  'coming-soon': '#6a8a5e',
  gone:          '#a89880',
}

const EMPTY_HERB = {
  name: '', emoji: '🌿', status: 'available',
  quantity: '', description: '', tip: '', season: ''
}

export default function HerbsEditor({ herbs, onAdd, onUpdate, onDelete, label = 'Herb' }) {
  const [editing, setEditing] = useState(null)   // herb id being edited
  const [editForm, setEditForm] = useState({})
  const [adding, setAdding] = useState(false)
  const [newForm, setNewForm] = useState(EMPTY_HERB)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const startEdit = (herb) => {
    setEditing(herb.id)
    setEditForm({ ...herb })
    setAdding(false)
  }

  const cancelEdit = () => { setEditing(null); setEditForm({}) }

  const saveEdit = async () => {
    await onUpdate(editing, editForm)
    setEditing(null)
  }

  const handleDeleteConfirm = async (id) => {
    await onDelete(id)
    setConfirmDelete(null)
  }

  const handleAdd = async () => {
    if (!newForm.name.trim()) return
    await onAdd(newForm)
    setNewForm(EMPTY_HERB)
    setAdding(false)
  }

  return (
    <div className="herbs-editor">
      <div className="admin-section-header">
        <div>
          <h2>{label} Availability</h2>
          <p>Manage what's in season and ready to share.</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={() => { setAdding(true); setEditing(null) }}>
          + Add {label}
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="herb-form herb-form--new">
          <h3>New {label}</h3>
          <HerbFormFields form={newForm} onChange={setNewForm} />
          <div className="herb-form__actions">
            <button className="admin-btn admin-btn--primary" onClick={handleAdd}>Add {label}</button>
            <button className="admin-btn admin-btn--ghost" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Herb list */}
      <div className="herb-list">
        {herbs.map(herb => (
          <div key={herb.id} className="herb-row">
            {editing === herb.id ? (
              <div className="herb-form">
                <HerbFormFields form={editForm} onChange={setEditForm} />
                <div className="herb-form__actions">
                  <button className="admin-btn admin-btn--primary" onClick={saveEdit}>Save Changes</button>
                  <button className="admin-btn admin-btn--ghost" onClick={cancelEdit}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="herb-row__view">
                <span className="herb-row__emoji">{herb.emoji}</span>
                <div className="herb-row__info">
                  <strong>{herb.name}</strong>
                  <span>{herb.quantity}</span>
                </div>
                <span
                  className="herb-row__status"
                  style={{ color: STATUS_COLORS[herb.status] }}
                >
                  {herb.status.replace('-', ' ')}
                </span>

                {/* Quick status buttons */}
                <div className="herb-row__quick">
                  {STATUSES.filter(s => s !== herb.status).map(s => (
                    <button
                      key={s}
                      className="herb-row__quick-btn"
                      title={`Mark as ${s}`}
                      onClick={() => onUpdate(herb.id, { ...herb, status: s })}
                    >
                      {s === 'available' ? '✓' : s === 'limited' ? '~' : s === 'coming-soon' ? '⏱' : '✕'}
                    </button>
                  ))}
                </div>

                <div className="herb-row__actions">
                  <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => startEdit(herb)}>Edit</button>
                  {confirmDelete === herb.id ? (
                    <>
                      <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => handleDeleteConfirm(herb.id)}>Confirm</button>
                      <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setConfirmDelete(null)}>Cancel</button>
                    </>
                  ) : (
                    <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setConfirmDelete(herb.id)}>Delete</button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function HerbFormFields({ form, onChange }) {
  const set = (field) => (e) => onChange(f => ({ ...f, [field]: e.target.value }))
  return (
    <div className="herb-form__fields">
      <div className="herb-form__row">
        <div className="admin-field">
          <label>Emoji</label>
          <input value={form.emoji} onChange={set('emoji')} style={{ width: '80px' }} />
        </div>
        <div className="admin-field" style={{ flex: 1 }}>
          <label>Name</label>
          <input value={form.name} onChange={set('name')} placeholder="e.g. Sweet Basil" />
        </div>
        <div className="admin-field">
          <label>Status</label>
          <select value={form.status} onChange={set('status')}>
            <option value="available">Available</option>
            <option value="limited">Limited</option>
            <option value="coming-soon">Coming Soon</option>
            <option value="gone">Gone for Now</option>
          </select>
        </div>
      </div>
      <div className="herb-form__row">
        <div className="admin-field" style={{ flex: 1 }}>
          <label>Quantity note</label>
          <input value={form.quantity} onChange={set('quantity')} placeholder="e.g. Plenty, A few bundles" />
        </div>
        <div className="admin-field" style={{ flex: 1 }}>
          <label>Season note</label>
          <input value={form.season} onChange={set('season')} placeholder="e.g. Peak season" />
        </div>
      </div>
      <div className="admin-field">
        <label>Description</label>
        <textarea rows={2} value={form.description} onChange={set('description')} placeholder="Short description for visitors..." />
      </div>
      <div className="admin-field">
        <label>Harvesting tip</label>
        <input value={form.tip} onChange={set('tip')} placeholder="e.g. Pick from the top to encourage bushy growth." />
      </div>
    </div>
  )
}
