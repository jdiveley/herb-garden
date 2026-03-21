import React, { useState, useEffect } from 'react'
import './Header.css'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="header__inner">
        <a href="#" className="header__logo">
          <span className="header__logo-icon">🐾</span>
          <span className="header__logo-text">Blackpaw Cottage</span>
        </a>

        <nav className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}>
          <a href="#herbs" onClick={() => setMenuOpen(false)}>Available Herbs</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>The Garden</a>
          <a href="#contact" className="header__nav-cta" onClick={() => setMenuOpen(false)}>Get in Touch</a>
        </nav>

        <button
          className={`header__burger ${menuOpen ? 'header__burger--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  )
}
