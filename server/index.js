import 'dotenv/config'
import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import cors from 'cors'
import nodemailer from 'nodemailer'
import multer from 'multer'
import { readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_FILE = join(__dirname, 'data.json')
const UPLOADS_DIR = join(__dirname, 'uploads')
mkdirSync(UPLOADS_DIR, { recursive: true })

const app = express()
app.use(express.json())
app.use(cors({ origin: true, credentials: true }))
app.use('/uploads', express.static(UPLOADS_DIR))

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop().toLowerCase()
    cb(null, `${Date.now()}.${ext}`)
  },
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

// ── Config ────────────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'blackpaw2024'
const JWT_SECRET     = process.env.JWT_SECRET     || 'change-this-secret-before-deploying'

// Load stored hash from data.json if present, otherwise hash the env password
const _initialData = JSON.parse(readFileSync(DATA_FILE, 'utf8'))
let currentPasswordHash = _initialData.passwordHash || bcrypt.hashSync(ADMIN_PASSWORD, 10)

// ── Mailer ────────────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// ── Helpers ───────────────────────────────────────────────────────────────────
const readData  = () => JSON.parse(readFileSync(DATA_FILE, 'utf8'))
const writeData = (data) => writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))

const authenticate = (req, res, next) => {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// ── Public routes ─────────────────────────────────────────────────────────────

// Get all site data
app.get('/api/data', (req, res) => {
  res.json(readData())
})

// Login
app.post('/api/login', (req, res) => {
  const { password } = req.body
  if (!password || !bcrypt.compareSync(password, currentPasswordHash)) {
    return res.status(401).json({ error: 'Incorrect password' })
  }
  const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token })
})

// Send contact email
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body
  if (!name || !email || !message) return res.status(400).json({ error: 'Name, email, and message are required' })

  try {
    await transporter.sendMail({
      from: `"Blackpaw Cottage Website" <${process.env.GMAIL_USER}>`,
      to: 'tami.titheridge@gmail.com',
      cc: process.env.CONTACT_EMAIL || process.env.GMAIL_USER,
      replyTo: email,
      subject: `🐾 Garden request from ${name}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 500px; color: #2a2018;">
          <h2 style="color: #3d5a36;">New garden request from your website</h2>
          <p><strong>From:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          <hr style="border: none; border-top: 1px solid #e0d8c8; margin: 1rem 0;" />
          <p style="line-height: 1.7;">${message.replace(/\n/g, '<br>')}</p>
          <hr style="border: none; border-top: 1px solid #e0d8c8; margin: 1rem 0;" />
          <p style="font-size: 0.85rem; color: #a89880;">Sent from blackpawcottage.com</p>
        </div>
      `,
    })
    res.json({ ok: true })
  } catch (err) {
    console.error('Email error:', err)
    res.status(500).json({ error: 'Failed to send email. Please check your Gmail app password.' })
  }
})

// ── Protected routes ──────────────────────────────────────────────────────────

// Change admin password
app.post('/api/change-password', authenticate, (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' })
  }
  if (!bcrypt.compareSync(currentPassword, currentPasswordHash)) {
    return res.status(401).json({ error: 'Current password is incorrect' })
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' })
  }
  currentPasswordHash = bcrypt.hashSync(newPassword, 10)
  const data = readData()
  data.passwordHash = currentPasswordHash
  writeData(data)
  res.json({ ok: true })
})

// Update hero text
app.put('/api/hero', authenticate, (req, res) => {
  const data = readData()
  data.hero = { ...data.hero, ...req.body }
  writeData(data)
  res.json(data.hero)
})

// Upload photo
app.post('/api/photos', authenticate, upload.single('photo'), (req, res) => {
  const data = readData()
  const newPhoto = {
    id: Date.now(),
    filename: req.file.filename,
    caption: req.body.caption || '',
    rotation: 0,
    width: 100,
  }
  data.photos.push(newPhoto)
  writeData(data)
  res.json(newPhoto)
})

// Update all photos metadata (rotation, width, caption, order)
app.put('/api/photos', authenticate, (req, res) => {
  const data = readData()
  data.photos = req.body
  writeData(data)
  res.json(data.photos)
})

// Delete photo
app.delete('/api/photos/:id', authenticate, (req, res) => {
  const data = readData()
  const photo = data.photos.find(p => p.id === Number(req.params.id))
  if (photo) {
    try { unlinkSync(join(UPLOADS_DIR, photo.filename)) } catch {}
    data.photos = data.photos.filter(p => p.id !== Number(req.params.id))
    writeData(data)
  }
  res.json({ ok: true })
})

// Update about text
app.put('/api/about', authenticate, (req, res) => {
  const data = readData()
  data.about = { ...data.about, ...req.body }
  writeData(data)
  res.json(data.about)
})

// Get all herbs
app.get('/api/herbs', authenticate, (req, res) => {
  res.json(readData().herbs)
})

// Add herb
app.post('/api/herbs', authenticate, (req, res) => {
  const data = readData()
  const newHerb = { ...req.body, id: Date.now() }
  data.herbs.push(newHerb)
  writeData(data)
  res.json(newHerb)
})

// Update herb
app.put('/api/herbs/:id', authenticate, (req, res) => {
  const data = readData()
  const idx = data.herbs.findIndex(h => h.id === Number(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Herb not found' })
  data.herbs[idx] = { ...data.herbs[idx], ...req.body }
  writeData(data)
  res.json(data.herbs[idx])
})

// Delete herb
app.delete('/api/herbs/:id', authenticate, (req, res) => {
  const data = readData()
  data.herbs = data.herbs.filter(h => h.id !== Number(req.params.id))
  writeData(data)
  res.json({ ok: true })
})

// Get all orchard items
app.get('/api/orchard', authenticate, (req, res) => {
  res.json(readData().orchard)
})

// Add orchard item
app.post('/api/orchard', authenticate, (req, res) => {
  const data = readData()
  const newItem = { ...req.body, id: Date.now() }
  data.orchard.push(newItem)
  writeData(data)
  res.json(newItem)
})

// Update orchard item
app.put('/api/orchard/:id', authenticate, (req, res) => {
  const data = readData()
  const idx = data.orchard.findIndex(h => h.id === Number(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Item not found' })
  data.orchard[idx] = { ...data.orchard[idx], ...req.body }
  writeData(data)
  res.json(data.orchard[idx])
})

// Delete orchard item
app.delete('/api/orchard/:id', authenticate, (req, res) => {
  const data = readData()
  data.orchard = data.orchard.filter(h => h.id !== Number(req.params.id))
  writeData(data)
  res.json({ ok: true })
})

// Get all pantry items
app.get('/api/pantry', authenticate, (req, res) => {
  res.json(readData().pantry)
})

// Add pantry item
app.post('/api/pantry', authenticate, (req, res) => {
  const data = readData()
  const newItem = { ...req.body, id: Date.now() }
  data.pantry.push(newItem)
  writeData(data)
  res.json(newItem)
})

// Update pantry item
app.put('/api/pantry/:id', authenticate, (req, res) => {
  const data = readData()
  const idx = data.pantry.findIndex(h => h.id === Number(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Item not found' })
  data.pantry[idx] = { ...data.pantry[idx], ...req.body }
  writeData(data)
  res.json(data.pantry[idx])
})

// Delete pantry item
app.delete('/api/pantry/:id', authenticate, (req, res) => {
  const data = readData()
  data.pantry = data.pantry.filter(h => h.id !== Number(req.params.id))
  writeData(data)
  res.json({ ok: true })
})

// Upload photo for a specific herb
app.post('/api/herbs/:id/photo', authenticate, upload.single('photo'), (req, res) => {
  const data = readData()
  const idx = data.herbs.findIndex(h => h.id === Number(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Herb not found' })
  if (data.herbs[idx].photo) {
    try { unlinkSync(join(UPLOADS_DIR, data.herbs[idx].photo)) } catch {}
  }
  data.herbs[idx].photo = req.file.filename
  writeData(data)
  res.json({ photo: req.file.filename })
})

// Delete photo for a specific herb
app.delete('/api/herbs/:id/photo', authenticate, (req, res) => {
  const data = readData()
  const idx = data.herbs.findIndex(h => h.id === Number(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Herb not found' })
  if (data.herbs[idx].photo) {
    try { unlinkSync(join(UPLOADS_DIR, data.herbs[idx].photo)) } catch {}
    delete data.herbs[idx].photo
    writeData(data)
  }
  res.json({ ok: true })
})

// Upload photo for a specific orchard item
app.post('/api/orchard/:id/photo', authenticate, upload.single('photo'), (req, res) => {
  const data = readData()
  const idx = data.orchard.findIndex(h => h.id === Number(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Item not found' })
  if (data.orchard[idx].photo) {
    try { unlinkSync(join(UPLOADS_DIR, data.orchard[idx].photo)) } catch {}
  }
  data.orchard[idx].photo = req.file.filename
  writeData(data)
  res.json({ photo: req.file.filename })
})

// Delete photo for a specific orchard item
app.delete('/api/orchard/:id/photo', authenticate, (req, res) => {
  const data = readData()
  const idx = data.orchard.findIndex(h => h.id === Number(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Item not found' })
  if (data.orchard[idx].photo) {
    try { unlinkSync(join(UPLOADS_DIR, data.orchard[idx].photo)) } catch {}
    delete data.orchard[idx].photo
    writeData(data)
  }
  res.json({ ok: true })
})

// Upload photo for a specific pantry item
app.post('/api/pantry/:id/photo', authenticate, upload.single('photo'), (req, res) => {
  const data = readData()
  const idx = data.pantry.findIndex(h => h.id === Number(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Item not found' })
  if (data.pantry[idx].photo) {
    try { unlinkSync(join(UPLOADS_DIR, data.pantry[idx].photo)) } catch {}
  }
  data.pantry[idx].photo = req.file.filename
  writeData(data)
  res.json({ photo: req.file.filename })
})

// Delete photo for a specific pantry item
app.delete('/api/pantry/:id/photo', authenticate, (req, res) => {
  const data = readData()
  const idx = data.pantry.findIndex(h => h.id === Number(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Item not found' })
  if (data.pantry[idx].photo) {
    try { unlinkSync(join(UPLOADS_DIR, data.pantry[idx].photo)) } catch {}
    delete data.pantry[idx].photo
    writeData(data)
  }
  res.json({ ok: true })
})

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(3002, () => {
  console.log('API server running on http://localhost:3002')
})
