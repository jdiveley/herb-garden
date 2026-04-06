import React, { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import AvailableHerbs from './components/AvailableHerbs.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import AboutGarden from './components/AboutGarden.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'

export default function PublicSite() {
  const [siteData, setSiteData] = useState(null)

  useEffect(() => {
    fetch('/api/data')
      .then(r => r.json())
      .then(setSiteData)
      .catch(console.error)
  }, [])

  if (!siteData) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <span style={{ fontFamily: 'var(--font-display)', color: 'var(--sage)', fontSize: '1.2rem' }}>
        🐾 Loading...
      </span>
    </div>
  )

  return (
    <div className="app">
      <Header />
      <main>
        <Hero data={siteData.hero} />
        <AvailableHerbs herbs={siteData.herbs} orchard={siteData.orchard} pantry={siteData.pantry} />
        <HowItWorks />
        <AboutGarden data={siteData.about} photos={siteData.photos} />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
