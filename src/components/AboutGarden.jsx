import React from 'react'
import './AboutGarden.css'

export default function AboutGarden({ data, photos = [] }) {
  const galleryPhotos = photos.filter(p => !p.heroImage)
  if (!data) return null
  return (
    <section id="about" className={`about${galleryPhotos.length === 0 ? ' about--no-photos' : ''}`}>
      <div className="about__text">
        <p className="section-label">The story</p>
        <h2 className="about__title">About Blackpaw Cottage</h2>
        <p>{data.paragraph1}</p>
        <p>{data.paragraph2}</p>
        <p>{data.paragraph3}</p>
        <p>{data.paragraph4}</p>
        <p className="about__sign">— <em>{data.signature}</em></p>
      </div>
      {galleryPhotos.length > 0 && (
        <div className="about__photos">
          {galleryPhotos.map(photo => (
            <div
              key={photo.id}
              className="about__photo-item"
              style={{ width: `${photo.width || 100}%` }}
            >
              <div className="about__photo-wrap">
                <img
                  src={`/uploads/${photo.filename}`}
                  alt={photo.caption || ''}
                  style={{ transform: `rotate(${photo.rotation || 0}deg)` }}
                />
              </div>
              {photo.caption && (
                <p className="about__photo-caption">{photo.caption}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
