import React, { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import AvailableHerbs from './components/AvailableHerbs.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import AboutGarden from './components/AboutGarden.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import Cart from './components/Cart.jsx'
import './components/Cart.css'

export default function PublicSite() {
  const [siteData, setSiteData] = useState(null)
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)

  const loadData = () =>
    fetch('/api/data').then(r => r.json()).then(setSiteData).catch(console.error)

  useEffect(() => { loadData() }, [])

  const addToCart = (item) => {
    const maxQty = item.stockQty != null ? item.stockQty : null
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id
          ? { ...i, qty: maxQty != null ? Math.min(i.qty + 1, maxQty) : i.qty + 1 }
          : i
        )
      }
      return [...prev, { id: item.id, name: item.name, emoji: item.emoji, qty: 1, maxQty }]
    })
    setCartOpen(true)
  }

  const updateCartQty = (id, qty) => {
    if (qty < 1) return
    setCart(prev => prev.map(i => {
      if (i.id !== id) return i
      const capped = i.maxQty != null ? Math.min(qty, i.maxQty) : qty
      return { ...i, qty: capped }
    }))
  }

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id))

  const handleOrderPlaced = () => {
    setCart([])
    loadData()
  }

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)

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
        <AvailableHerbs
          herbs={siteData.herbs}
          orchard={siteData.orchard}
          pantry={siteData.pantry}
          cart={cart}
          onAddToCart={addToCart}
        />
        <HowItWorks />
        <AboutGarden data={siteData.about} photos={siteData.photos} />
        <Contact />
      </main>
      <Footer />

      {cartCount > 0 && (
        <button className="cart-fab" onClick={() => setCartOpen(true)} aria-label="Open basket">
          🧺
          <span className="cart-fab__badge">{cartCount}</span>
          Basket
        </button>
      )}

      {cartOpen && (
        <Cart
          cart={cart}
          onUpdateQty={updateCartQty}
          onRemove={removeFromCart}
          onClose={() => setCartOpen(false)}
          onOrderPlaced={handleOrderPlaced}
        />
      )}
    </div>
  )
}
