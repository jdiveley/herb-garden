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
  { id: 'hero',     label: '🏠 Homepage Text' },
  { id: 'about',    label: '📖 About Section' },
  { id: 'photos',   label: '📷 Garden Photos' },
  { id: 'security', label: '🔒 Security' },
]

function ChangePasswordForm({ authHeaders, showToast }) {
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
      const res = await fetch('/api/change-password', {
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

  const saveHero = async (hero) => {
    setSaving(true)
    try {
      const res = await fetch('/api/hero', { method: 'PUT', headers: authHeaders, body: JSON.stringify(hero) })
      if (!res.ok) throw new Error()
      setSiteData(d => ({ ...d, hero }))
      showToast('Homepage text saved!')
    } catch { showToast('Error saving. Please try again.') }
    finally { setSaving(false) }
  }

  const saveAbout = async (about) => {
    setSaving(true)
    try {
      const res = await fetch('/api/about', { method: 'PUT', headers: authHeaders, body: JSON.stringify(about) })
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
      const res = await fetch('/api/photos', {
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
      const res = await fetch('/api/photos', { method: 'PUT', headers: authHeaders, body: JSON.stringify(photos) })
      if (!res.ok) throw new Error()
      setSiteData(d => ({ ...d, photos }))
      showToast('Photos saved!')
    } catch { showToast('Error saving. Please try again.') }
    finally { setSaving(false) }
  }

  const deletePhoto = async (id) => {
    try {
      await fetch(`/api/photos/${id}`, { method: 'DELETE', headers: authHeaders })
      setSiteData(d => ({ ...d, photos: (d.photos || []).filter(p => p.id !== id) }))
      showToast('Photo deleted.')
    } catch { showToast('Error deleting photo.') }
  }

  const uploadItemPhoto = async (id, file, type) => {
    const formData = new FormData()
    formData.append('photo', file)
    try {
      const res = await fetch(`/api/${type}/${id}/photo`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      })
      const { photo } = await res.json()
      if (type === 'herbs') {
        setSiteData(d => ({ ...d, herbs: d.herbs.map(h => h.id === id ? { ...h, photo } : h) }))
      } else {
        setSiteData(d => ({ ...d, orchard: (d.orchard || []).map(h => h.id === id ? { ...h, photo } : h) }))
      }
      showToast('Photo uploaded!')
      return { photo }
    } catch {
      showToast('Photo upload failed.')
      return null
    }
  }

  const deleteItemPhoto = async (id, type) => {
    try {
      await fetch(`/api/${type}/${id}/photo`, { method: 'DELETE', headers: authHeaders })
      if (type === 'herbs') {
        setSiteData(d => ({ ...d, herbs: d.herbs.map(h => h.id === id ? { ...h, photo: undefined } : h) }))
      } else {
        setSiteData(d => ({ ...d, orchard: (d.orchard || []).map(h => h.id === id ? { ...h, photo: undefined } : h) }))
      }
      showToast('Photo removed.')
    } catch {
      showToast('Failed to remove photo.')
    }
  }

  const addOrchardItem = async (item) => {
    const res = await fetch('/api/orchard', { method: 'POST', headers: authHeaders, body: JSON.stringify(item) })
    const newItem = await res.json()
    setSiteData(d => ({ ...d, orchard: [...(d.orchard || []), newItem] }))
    showToast(`${newItem.name} added!`)
  }

  const updateOrchardItem = async (id, updates) => {
    const res = await fetch(`/api/orchard/${id}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify(updates) })
    const updated = await res.json()
    setSiteData(d => ({ ...d, orchard: (d.orchard || []).map(h => h.id === id ? updated : h) }))
    showToast('Item updated!')
  }

  const deleteOrchardItem = async (id) => {
    await fetch(`/api/orchard/${id}`, { method: 'DELETE', headers: authHeaders })
    setSiteData(d => ({ ...d, orchard: (d.orchard || []).filter(h => h.id !== id) }))
    showToast('Item removed.')
  }

  const addHerb = async (herb) => {
    const res = await fetch('/api/herbs', { method: 'POST', headers: authHeaders, body: JSON.stringify(herb) })
    const newHerb = await res.json()
    setSiteData(d => ({ ...d, herbs: [...d.herbs, newHerb] }))
    showToast(`${newHerb.name} added!`)
  }

  const updateHerb = async (id, updates) => {
    const res = await fetch(`/api/herbs/${id}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify(updates) })
    const updated = await res.json()
    setSiteData(d => ({ ...d, herbs: d.herbs.map(h => h.id === id ? updated : h) }))
    showToast('Herb updated!')
  }

  const deleteHerb = async (id) => {
    await fetch(`/api/herbs/${id}`, { method: 'DELETE', headers: authHeaders })
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
          <ChangePasswordForm authHeaders={authHeaders} showToast={showToast} />
        )}
      </main>

      {toast && <div className="admin-toast">{toast}</div>}
    </div>
  )
}
