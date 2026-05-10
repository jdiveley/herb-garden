import React, { useState } from 'react'
import './Cart.css'

export default function Cart({ cart, onUpdateQty, onRemove, onClose, onOrderPlaced }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          items: cart.map(i => ({ id: i.id, name: i.name, emoji: i.emoji, qty: i.qty })),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong')
      }
      setDone(true)
      onOrderPlaced()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-panel" onClick={e => e.stopPropagation()}>
        <div className="cart-panel__header">
          <h2>Your Basket</h2>
          <button className="cart-panel__close" onClick={onClose} aria-label="Close cart">✕</button>
        </div>

        {done ? (
          <div className="cart-done">
            <span className="cart-done__icon">🌿</span>
            <h3>Request sent!</h3>
            <p>
              We'll be in touch soon to arrange your pick-up.
              Thank you for being a good neighbour.
            </p>
            <button className="cart-btn cart-btn--primary" onClick={onClose}>Back to garden</button>
          </div>
        ) : (
          <>
            {cart.length === 0 ? (
              <p className="cart-empty">
                Nothing in your basket yet — browse the herbs above and tap "Add to basket".
              </p>
            ) : (
              <ul className="cart-items">
                {cart.map(item => (
                  <li key={item.id} className="cart-item">
                    <span className="cart-item__emoji">{item.emoji}</span>
                    <span className="cart-item__name">{item.name}</span>
                    <div className="cart-item__qty">
                      <button
                        onClick={() => onUpdateQty(item.id, item.qty - 1)}
                        disabled={item.qty <= 1}
                        aria-label="Decrease quantity"
                      >−</button>
                      <span>{item.qty}</span>
                      <button
                        onClick={() => onUpdateQty(item.id, item.qty + 1)}
                        disabled={item.maxQty != null && item.qty >= item.maxQty}
                        aria-label="Increase quantity"
                      >+</button>
                    </div>
                    <button
                      className="cart-item__remove"
                      onClick={() => onRemove(item.id)}
                      aria-label={`Remove ${item.name}`}
                    >✕</button>
                  </li>
                ))}
              </ul>
            )}

            {cart.length > 0 && (
              <form className="cart-form" onSubmit={handleSubmit}>
                <p className="cart-form__heading">Your details</p>
                <div className="cart-field">
                  <label htmlFor="cart-name">Name</label>
                  <input
                    id="cart-name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                  />
                </div>
                <div className="cart-field">
                  <label htmlFor="cart-phone">Phone</label>
                  <input
                    id="cart-phone"
                    name="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Best number to reach you"
                  />
                </div>
                <div className="cart-field">
                  <label htmlFor="cart-email">Email</label>
                  <input
                    id="cart-email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                  />
                </div>
                {error && <p className="cart-error">{error}</p>}
                <button type="submit" className="cart-btn cart-btn--primary" disabled={submitting}>
                  {submitting ? 'Sending…' : `Send request · ${totalItems} item${totalItems !== 1 ? 's' : ''}`}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}
