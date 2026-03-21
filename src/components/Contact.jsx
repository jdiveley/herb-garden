import React, { useState } from 'react'
import './Contact.css'

export default function Contact() {
  const [form, setForm] = useState({ name: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()
    // In production: wire up to Formspree, Netlify Forms, EmailJS, etc.
    setSent(true)
  }

  return (
    <section id="contact" className="contact">
      <div className="contact__header">
        <p className="section-label">Get in touch</p>
        <h2 className="contact__title">Request Some Herbs</h2>
        <p className="contact__subtitle">
          Let us know what you'd like and we'll set a bundle aside for you.
          We usually respond within a day.
        </p>
      </div>

      {sent ? (
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

          <button type="submit" className="contact__submit">
            Send Message
          </button>

          <p className="contact__note">
            No account needed. Your message goes straight to our inbox.
          </p>
        </form>
      )}
    </section>
  )
}
