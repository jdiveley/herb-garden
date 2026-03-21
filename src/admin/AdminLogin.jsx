import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Admin.css'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      localStorage.setItem('admin_token', data.token)
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__box">
        <div className="admin-login__logo">🐾</div>
        <h1>Blackpaw Cottage</h1>
        <p className="admin-login__sub">Garden Dashboard</p>

        <form onSubmit={handleSubmit}>
          <div className="admin-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoFocus
              required
            />
          </div>
          {error && <p className="admin-error">{error}</p>}
          <button type="submit" className="admin-btn admin-btn--full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <a href="/" className="admin-login__back">← Back to site</a>
      </div>
    </div>
  )
}
