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

      <div className="hero__illustration" aria-hidden="true">
        <div className="hero__pot">
          <div className="hero__pot-body">
            <div className="hero__plant">
              <span className="hero__leaf hero__leaf--1">🌿</span>
              <span className="hero__leaf hero__leaf--2">🌱</span>
              <span className="hero__leaf hero__leaf--3">🌿</span>
              <span className="hero__leaf hero__leaf--4">🌾</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
