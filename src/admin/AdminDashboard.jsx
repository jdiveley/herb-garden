import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HerbsEditor from './HerbsEditor.jsx'
import HeroEditor from './HeroEditor.jsx'
import AboutEditor from './AboutEditor.jsx'
import PhotosEditor from './PhotosEditor.jsx'
import './Admin.css'

const TABS = [
  { id: 'herbs',    label: '🌿 Herbs' },
  { id: 'orchard',  label: '🍋 Orchard' },
  { id: 'pantry',   label: '🫙 Pantry' },
  { id: 'store',    label: '🏪 Store' },
  { id: 'hero',     label: '🏠 Homepage Text' },
  { id: 'about',    label: '📖 About Section' },
  { id: 'photos',   label: '📷 Garden Photos' },
  { id: 'security', label: '🔒 Security' },
]

function StoreEditor({ storeClosed, storeClosedMessage, onToggle, onSaveMessage, showToast }) {
  const [message, setMessage] = useState(storeClosedMessage)
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    await onSaveMessage(message)
    setSaving(false)
  }

  return (
    <div className="admin-editor">
      <div className="admin-section-header">
        <div>
          <h2>Store Status</h2>
          <p>Control whether neighbours can place orders</p>
        </div>
      </div>

      <div className="admin-card" style={{ maxWidth: 520 }}>
        <div className="admin-store-status-row">
          <div>
            <p className="admin-store-status-label">Orders are currently</p>
            <p className="admin-store-status-value" style={{ color: storeClosed ? '#c0392b' : '#3d5a36' }}>
              {storeClosed ? 'Closed' : 'Open'}
            </p>
          </div>
          <button
            onClick={onToggle}
            className={`admin-btn admin-store-toggle ${storeClosed ? 'admin-store-toggle--closed' : 'admin-store-toggle--open'}`}
          >
            {storeClosed ? '🔴 Store Closed' : '🟢 Store Open'}
          </button>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e0d8c8', margin: '1.5rem 0' }} />

        <form onSubmit={handleSave}>
          <div className="admin-field">
            <label>Closed message <span>(shown to neighbours when orders are paused)</span></label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              placeholder="e.g. We've run out of herbs for this harvest window — check back soon!"
            />
          </div>
          <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save Message'}
          </button>
        </form>
      </div>
    </div>
  )
}

function ChangePasswordForm({ authHeaders, authFetch, showToast }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match')
      return
    }
    setSaving(true)
    try {
      const res = await authFetch('/api/change-password', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to change password'); return }
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      showToast('Password changed successfully!')
    } catch { setError('Failed to change password. Please try again.') }
    finally { setSaving(false) }
  }

  return (
    <div className="admin-editor">
      <div className="admin-section-header">
        <div>
          <h2>Change Password</h2>
          <p>Update the admin login password</p>
        </div>
      </div>
      <div className="admin-card" style={{ maxWidth: 420 }}>
        <form onSubmit={handleSubmit}>
          {error && <div className="admin-error">{error}</div>}
          <div className="admin-field">
            <label>Current Password</label>
            <input
              type="password"
              value={form.currentPassword}
              onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))}
              required
              autoComplete="current-password"
            />
          </div>
          <div className="admin-field">
            <label>New Password <span>(min 8 characters)</span></label>
            <input
              type="password"
              value={form.newPassword}
              onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div className="admin-field">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
              required
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
            {saving ? 'Saving…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('herbs')
  const [siteData, setSiteData] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const navigate = useNavigate()

  const token = localStorage.getItem('admin_token')
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }

  const authFetch = (url, options) => fetch(url, options).then(res => {
    if (res.status === 401) {
      logout()
      return new Promise(() => {})
    }
    return res
  })

  useEffect(() => {
    fetch('/api/data')
      .then(r => r.json())
      .then(setSiteData)
      .catch(console.error)
  }, [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const toggleStore = async () => {
    const newClosed = !siteData.storeClosed
    try {
      const res = await authFetch('/api/store-status', {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ storeClosed: newClosed }),
      })
      if (!res.ok) throw new Error()
      setSiteData(d => ({ ...d, storeClosed: newClosed }))
      showToast(newClosed ? 'Store closed — orders paused.' : 'Store open — orders enabled!')
    } catch { showToast('Failed to update store status.') }
  }

  const saveStoreMessage = async (storeClosedMessage) => {
    try {
      const res = await authFetch('/api/store-status', {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ storeClosedMessage }),
      })
      if (!res.ok) throw new Error()
      setSiteData(d => ({ ...d, storeClosedMessage }))
      showToast('Closed message saved!')
    } catch { showToast('Failed to save message.') }
  }

  const saveHero = async (hero) => {
    setSaving(true)
    try {
      const res = await authFetch('/api/hero', { method: 'PUT', headers: authHeaders, body: JSON.stringify(hero) })
      if (!res.ok) throw new Error()
      setSiteData(d => ({ ...d, hero }))
      showToast('Homepage text saved!')
    } catch { showToast('Error saving. Please try again.') }
    finally { setSaving(false) }
  }

  const saveAbout = async (about) => {
    setSaving(true)
    try {
      const res = await authFetch('/api/about', { method: 'PUT', headers: authHeaders, body: JSON.stringify(about) })
      if (!res.ok) throw new Error()
      setSiteData(d => ({ ...d, about }))
      showToast('About section saved!')
    } catch { showToast('Error saving. Please try again.') }
    finally { setSaving(false) }
  }

  const uploadPhoto = async (file) => {
    const formData = new FormData()
    formData.append('photo', file)
    try {
      const res = await authFetch('/api/photos', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      })
      if (!res.ok) throw new Error()
      const newPhoto = await res.json()
      setSiteData(d => ({ ...d, photos: [...(d.photos || []), newPhoto] }))
      showToast('Photo uploaded!')
    } catch { showToast('Upload failed. Please try again.') }
  }

  const savePhotos = async (photos) => {
    setSaving(true)
    try {
      const res = await authFetch('/api/photos', { method: 'PUT', headers: authHeaders, body: JSON.stringify(photos) })
      if (!res.ok) throw new Error()
      setSiteData(d => ({ ...d, photos }))
      showToast('Photos saved!')
    } catch { showToast('Error saving. Please try again.') }
    finally { setSaving(false) }
  }

  const deletePhoto = async (id) => {
    try {
      await authFetch(`/api/photos/${id}`, { method: 'DELETE', headers: authHeaders })
      setSiteData(d => ({ ...d, photos: (d.photos || []).filter(p => p.id !== id) }))
      showToast('Photo deleted.')
    } catch { showToast('Error deleting photo.') }
  }

  const uploadItemPhoto = async (id, file, type) => {
    const formData = new FormData()
    formData.append('photo', file)
    try {
      const res = await authFetch(`/api/${type}/${id}/photo`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      })
      const { photo } = await res.json()
      setSiteData(d => ({ ...d, [type]: (d[type] || []).map(h => h.id === id ? { ...h, photo } : h) }))
      showToast('Photo uploaded!')
      return { photo }
    } catch {
      showToast('Photo upload failed.')
      return null
    }
  }

  const deleteItemPhoto = async (id, type) => {
    try {
      await authFetch(`/api/${type}/${id}/photo`, { method: 'DELETE', headers: authHeaders })
      setSiteData(d => ({ ...d, [type]: (d[type] || []).map(h => h.id === id ? { ...h, photo: undefined } : h) }))
      showToast('Photo removed.')
    } catch {
      showToast('Failed to remove photo.')
    }
  }

  const addOrchardItem = async (item) => {
    try {
      const res = await authFetch('/api/orchard', { method: 'POST', headers: authHeaders, body: JSON.stringify(item) })
      if (!res.ok) throw new Error()
      const newItem = await res.json()
      setSiteData(d => ({ ...d, orchard: [...(d.orchard || []), newItem] }))
      showToast(`${newItem.name} added!`)
    } catch { showToast('Error adding item. Try restarting the server.') }
  }

  const updateOrchardItem = async (id, updates) => {
    try {
      const res = await authFetch(`/api/orchard/${id}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify(updates) })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setSiteData(d => ({ ...d, orchard: (d.orchard || []).map(h => h.id === id ? updated : h) }))
      showToast('Item updated!')
    } catch { showToast('Error updating item.') }
  }

  const deleteOrchardItem = async (id) => {
    await authFetch(`/api/orchard/${id}`, { method: 'DELETE', headers: authHeaders })
    setSiteData(d => ({ ...d, orchard: (d.orchard || []).filter(h => h.id !== id) }))
    showToast('Item removed.')
  }

  const addPantryItem = async (item) => {
    try {
      const res = await authFetch('/api/pantry', { method: 'POST', headers: authHeaders, body: JSON.stringify(item) })
      if (!res.ok) throw new Error()
      const newItem = await res.json()
      setSiteData(d => ({ ...d, pantry: [...(d.pantry || []), newItem] }))
      showToast(`${newItem.name} added!`)
    } catch { showToast('Error adding item. Try restarting the server.') }
  }

  const updatePantryItem = async (id, updates) => {
    try {
      const res = await authFetch(`/api/pantry/${id}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify(updates) })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setSiteData(d => ({ ...d, pantry: (d.pantry || []).map(h => h.id === id ? updated : h) }))
      showToast('Item updated!')
    } catch { showToast('Error updating item.') }
  }

  const deletePantryItem = async (id) => {
    try {
      await authFetch(`/api/pantry/${id}`, { method: 'DELETE', headers: authHeaders })
      setSiteData(d => ({ ...d, pantry: (d.pantry || []).filter(h => h.id !== id) }))
      showToast('Item removed.')
    } catch { showToast('Error removing item.') }
  }

  const addHerb = async (herb) => {
    try {
      const res = await authFetch('/api/herbs', { method: 'POST', headers: authHeaders, body: JSON.stringify(herb) })
      if (!res.ok) throw new Error()
      const newHerb = await res.json()
      setSiteData(d => ({ ...d, herbs: [...d.herbs, newHerb] }))
      showToast(`${newHerb.name} added!`)
    } catch { showToast('Error adding herb. Try restarting the server.') }
  }

  const updateHerb = async (id, updates) => {
    try {
      const res = await authFetch(`/api/herbs/${id}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify(updates) })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setSiteData(d => ({ ...d, herbs: d.herbs.map(h => h.id === id ? updated : h) }))
      showToast('Herb updated!')
    } catch { showToast('Error updating herb.') }
  }

  const deleteHerb = async (id) => {
    await authFetch(`/api/herbs/${id}`, { method: 'DELETE', headers: authHeaders })
    setSiteData(d => ({ ...d, herbs: d.herbs.filter(h => h.id !== id) }))
    showToast('Herb removed.')
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    navigate('/admin/login')
  }

  if (!siteData) return (
    <div className="admin-loading">
      <span>🐾 Loading dashboard...</span>
    </div>
  )

  return (
    <div className="admin">
      <header className="admin-header">
        <div className="admin-header__left">
          <span className="admin-header__logo">🐾</span>
          <div>
            <h1>Blackpaw Cottage</h1>
            <p>Garden Dashboard</p>
          </div>
        </div>
        <div className="admin-header__right">
          <button
            onClick={toggleStore}
            className={`admin-btn admin-store-toggle ${siteData.storeClosed ? 'admin-store-toggle--closed' : 'admin-store-toggle--open'}`}
          >
            {siteData.storeClosed ? '🔴 Store Closed' : '🟢 Store Open'}
          </button>
          <a href="/" target="_blank" className="admin-btn admin-btn--ghost">View Site ↗</a>
          <button onClick={logout} className="admin-btn admin-btn--ghost">Sign Out</button>
        </div>
      </header>

      <nav className="admin-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`admin-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="admin-content">
        {tab === 'herbs' && (
          <HerbsEditor herbs={siteData.herbs} onAdd={addHerb} onUpdate={updateHerb} onDelete={deleteHerb}
            onUploadPhoto={(id, file) => uploadItemPhoto(id, file, 'herbs')}
            onDeletePhoto={(id) => deleteItemPhoto(id, 'herbs')}
            saving={saving} />
        )}
        {tab === 'orchard' && (
          <HerbsEditor herbs={siteData.orchard || []} onAdd={addOrchardItem} onUpdate={updateOrchardItem} onDelete={deleteOrchardItem}
            onUploadPhoto={(id, file) => uploadItemPhoto(id, file, 'orchard')}
            onDeletePhoto={(id) => deleteItemPhoto(id, 'orchard')}
            saving={saving} label="Orchard Item" />
        )}
        {tab === 'pantry' && (
          <HerbsEditor herbs={siteData.pantry || []} onAdd={addPantryItem} onUpdate={updatePantryItem} onDelete={deletePantryItem}
            onUploadPhoto={(id, file) => uploadItemPhoto(id, file, 'pantry')}
            onDeletePhoto={(id) => deleteItemPhoto(id, 'pantry')}
            saving={saving} label="Pantry Item" />
        )}
        {tab === 'store' && (
          <StoreEditor
            storeClosed={siteData.storeClosed}
            storeClosedMessage={siteData.storeClosedMessage}
            onToggle={toggleStore}
            onSaveMessage={saveStoreMessage}
            showToast={showToast}
          />
        )}
        {tab === 'hero' && (
          <HeroEditor data={siteData.hero} onSave={saveHero} saving={saving} />
        )}
        {tab === 'about' && (
          <AboutEditor data={siteData.about} onSave={saveAbout} saving={saving} />
        )}
        {tab === 'photos' && (
          <PhotosEditor
            photos={siteData.photos || []}
            onUpload={uploadPhoto}
            onSave={savePhotos}
            onDelete={deletePhoto}
            saving={saving}
          />
        )}
        {tab === 'security' && (
          <ChangePasswordForm authHeaders={authHeaders} authFetch={authFetch} showToast={showToast} />
        )}
      </main>

      {toast && <div className="admin-toast">{toast}</div>}
    </div>
  )
}
