import React, { useState } from 'react'
import './Contact.css'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="contact">
      <div className="contact__header">
        <p className="section-label">Get in touch</p>
        <h2 className="contact__title">Request from the Garden</h2>
        <p className="contact__subtitle">
          Let us know which herbs you'd like — or anything from the orchard — and we'll set it aside for you.
          We usually respond within a day.
        </p>
      </div>

      {status === 'sent' ? (
        <div className="contact__thanks">
          <span className="contact__thanks-icon">🌿</span>
          <h3>Message received!</h3>
          <p>
            We'll be in touch soon to arrange your pick-up. Thank you for
            being a good neighbor.
          </p>
        </div>
      ) : (
        <form className="contact__form" onSubmit={handleSubmit}>
          <div className="contact__field">
            <label htmlFor="name">Your name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Margaret from down the street"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="contact__field">
            <label htmlFor="email">Your email <span className="contact__required">*</span></label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="e.g. margaret@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="contact__field">
            <label htmlFor="phone">Phone number <span className="contact__optional">(optional)</span></label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="e.g. 07700 900123"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className="contact__field">
            <label htmlFor="message">What you'd like</label>
            <textarea
              id="message"
              name="message"
              rows={5}
              placeholder="e.g. I'd love some basil and rosemary — I could come by Friday morning..."
              value={form.message}
              onChange={handleChange}
              required
            />
          </div>

          {status === 'error' && (
            <p className="contact__error">
              Something went wrong sending your message. Please try again.
            </p>
          )}

          <button type="submit" className="contact__submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending...' : 'Send Message'}
          </button>

          <p className="contact__note">
            No account needed. Your message goes straight to our inbox.
          </p>
        </form>
      )}
    </section>
  )
}
