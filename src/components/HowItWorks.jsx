import React from 'react'
import './HowItWorks.css'

const STEPS = [
  {
    number: '01',
    title: "Browse what's available",
    body: "Check the list above for what's currently ready. Availability changes week to week with the seasons and rainfall.",
    icon: '🔍',
  },
  {
    number: '02',
    title: 'Send a quick message',
    body: "Drop us a note through the contact form — just say which herbs (or orchard picks) you'd like and roughly when you might stop by.",
    icon: '✉️',
  },
  {
    number: '03',
    title: 'Pick up at your convenience',
    body: "We'll leave your bundle on the front porch in a paper bag. Mornings and evenings work best. No need to knock.",
    icon: '🏡',
  },
  {
    number: '04',
    title: 'Enjoy — and pass it on',
    body: 'Use it fresh, dry it, share it further. The only ask is that you pay it forward to your own neighbors someday.',
    icon: '🌻',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="how">
      <div className="how__header">
        <p className="section-label">Simple as can be</p>
        <h2 className="how__title">How It Works</h2>
      </div>

      <div className="how__steps">
        {STEPS.map((step, i) => (
          <div key={i} className="how__step">
            <div className="how__step-number">{step.number}</div>
            <div className="how__step-icon">{step.icon}</div>
            <h3 className="how__step-title">{step.title}</h3>
            <p className="how__step-body">{step.body}</p>
          </div>
        ))}
      </div>

      <div className="how__note">
        <span className="how__note-leaf">🌿</span>
        <p>
          Everything is free. This garden is a small act of community, not a business.
          Neighbors helping neighbors — the old-fashioned way.
        </p>
      </div>

      <div className="how__note how__note--request">
        <span className="how__note-leaf">🌱</span>
        <p>
          <strong>Don't see what you're looking for?</strong> Send us a request anyway — we love
          knowing what neighbors would find useful. If there's enough interest, we'll grow it.
        </p>
      </div>
    </section>
  )
}
