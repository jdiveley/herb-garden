import React, { useState, useEffect, useRef } from 'react'

export default function PhotosEditor({ photos: initial, onUpload, onSave, onDelete, saving }) {
  const [photos, setPhotos] = useState(initial || [])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef()

  useEffect(() => setPhotos(initial || []), [initial])

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    for (const file of files) {
      await onUpload(file)
    }
    setUploading(false)
    e.target.value = ''
  }

  const update = (id, field, value) => {
    setPhotos(ps => ps.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const rotate = (id, dir) => {
    setPhotos(ps => ps.map(p =>
      p.id === id ? { ...p, rotation: (((p.rotation || 0) + dir * 90) + 360) % 360 } : p
    ))
  }

  const move = (index, newIndex) => {
    if (newIndex < 0 || newIndex >= photos.length) return
    const next = [...photos]
    const [item] = next.splice(index, 1)
    next.splice(newIndex, 0, item)
    setPhotos(next)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length) {
      setUploading(true)
      Promise.all(files.map(f => onUpload(f))).then(() => setUploading(false))
    }
  }

  return (
    <div className="admin-editor">
      <div className="admin-section-header">
        <div>
          <h2>Garden Photos</h2>
          <p>Upload photos to display in the About section. Rotate, resize, and reorder as needed.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="admin-btn admin-btn--ghost"
            onClick={() => fileInputRef.current.click()}
            disabled={uploading || saving}
          >
            {uploading ? 'Uploading...' : '+ Upload'}
          </button>
          {photos.length > 0 && (
            <button
              className="admin-btn admin-btn--primary"
              onClick={() => onSave(photos)}
              disabled={saving || uploading}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleFiles}
        />
      </div>

      {photos.length === 0 ? (
        <div
          className="admin-card photos-editor__drop-zone"
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileInputRef.current.click()}
        >
          <div className="photos-editor__drop-inner">
            <span className="photos-editor__drop-icon">🖼</span>
            <p>Drop photos here or click to upload</p>
            <p className="photos-editor__drop-hint">JPG, PNG, WebP · Max 10 MB each</p>
          </div>
        </div>
      ) : (
        <>
          <div
            className="photos-editor__grid"
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
          >
            {photos.map((photo, i) => (
              <div key={photo.id} className="photos-editor__item">
                <div className="photos-editor__thumb-wrap">
                  <img
                    src={`/uploads/${photo.filename}`}
                    alt=""
                    style={{ transform: `rotate(${photo.rotation || 0}deg)` }}
                  />
                </div>

                <div className="photos-editor__controls">
                  <div className="photos-editor__rotate-row">
                    <button
                      className="admin-btn admin-btn--ghost admin-btn--sm"
                      onClick={() => rotate(photo.id, -1)}
                      title="Rotate left"
                    >↺</button>
                    <span className="photos-editor__deg">{photo.rotation || 0}°</span>
                    <button
                      className="admin-btn admin-btn--ghost admin-btn--sm"
                      onClick={() => rotate(photo.id, 1)}
                      title="Rotate right"
                    >↻</button>
                  </div>

                  <div className="admin-field">
                    <label>Size</label>
                    <select
                      value={photo.width || 100}
                      onChange={e => update(photo.id, 'width', Number(e.target.value))}
                    >
                      <option value={100}>Full width</option>
                      <option value={50}>Half width</option>
                      <option value={33}>Third width</option>
                    </select>
                  </div>

                  <div className="admin-field">
                    <label>Caption <span>(optional)</span></label>
                    <input
                      value={photo.caption || ''}
                      onChange={e => update(photo.id, 'caption', e.target.value)}
                      placeholder="Add a caption…"
                    />
                  </div>

                  <div className="photos-editor__actions">
                    <button
                      className="admin-btn admin-btn--ghost admin-btn--sm"
                      onClick={() => move(i, i - 1)}
                      disabled={i === 0}
                      title="Move up"
                    >↑</button>
                    <button
                      className="admin-btn admin-btn--ghost admin-btn--sm"
                      onClick={() => move(i, i + 1)}
                      disabled={i === photos.length - 1}
                      title="Move down"
                    >↓</button>
                    <button
                      className="admin-btn admin-btn--danger admin-btn--sm"
                      onClick={() => onDelete(photo.id)}
                    >Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="admin-preview">
            <p className="admin-preview__label">Preview (About section sidebar)</p>
            <div className="admin-preview__box">
              <div className="photos-editor__preview-gallery">
                {photos.map(photo => (
                  <div
                    key={photo.id}
                    className="photos-editor__preview-item"
                    style={{ width: `${photo.width || 100}%` }}
                  >
                    <div className="photos-editor__preview-wrap">
                      <img
                        src={`/uploads/${photo.filename}`}
                        alt=""
                        style={{ transform: `rotate(${photo.rotation || 0}deg)` }}
                      />
                    </div>
                    {photo.caption && (
                      <p className="photos-editor__preview-caption">{photo.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
