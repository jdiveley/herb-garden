import React from 'react'
import './Hero.css'

export default function Hero({ data }) {
  if (!data) return null
  return (
    <section className="hero">
      <div className="hero__bg" aria-hidden="true">
        <div className="hero__circle hero__circle--1" />
        <div className="hero__circle hero__circle--2" />
      </div>

      <div className="hero__content">
        <p className="section-label">{data.eyebrow}</p>
        <h1 className="hero__title">
          {data.title}<br />
          <em>{data.titleEmphasis}</em>
        </h1>
        <p className="hero__desc">{data.description}</p>
        <div className="hero__actions">
          <a href="#herbs" className="hero__btn hero__btn--primary">See What's Available</a>
          <a href="#how-it-works" className="hero__btn hero__btn--ghost">How it works ↓</a>
        </div>
      </div>

      <div className="hero__illustration">
        <img src="/uploads/1774130148395.jpeg" alt="Blackpaw Cottage garden" className="hero__photo" />
      </div>
    </section>
  )
}
