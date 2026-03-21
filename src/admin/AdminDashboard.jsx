import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HerbsEditor from './HerbsEditor.jsx'
import HeroEditor from './HeroEditor.jsx'
import AboutEditor from './AboutEditor.jsx'
import PhotosEditor from './PhotosEditor.jsx'
import './Admin.css'

const TABS = [
  { id: 'herbs', label: '🌿 Herbs' },
  { id: 'hero',  label: '🏠 Homepage Text' },
  { id: 'about', label: '📖 About Section' },
  { id: 'photos', label: '📷 Garden Photos' },
]

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
          <HerbsEditor herbs={siteData.herbs} onAdd={addHerb} onUpdate={updateHerb} onDelete={deleteHerb} saving={saving} />
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
      </main>

      {toast && <div className="admin-toast">{toast}</div>}
    </div>
  )
}
