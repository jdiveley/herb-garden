import React from 'react'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <span className="footer__icon">🐾</span>
          <span className="footer__name">Blackpaw Cottage</span>
        </div>
        <p className="footer__tagline">
          A home garden in Narangba, QLD. Growing since 2025.
        </p>
        <p className="footer__copy">
          Made with compost &amp; care · No rights reserved · Share freely
        </p>
      </div>
    </footer>
  )
}
