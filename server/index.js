const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))
app.use(morgan('dev'))

const ProjectSchema = new mongoose.Schema(
	{
		projectId: { type: String, index: true, unique: true },
		files: {},
		activePath: String,
	},
	{ timestamps: true }
)

const Project = mongoose.model('Project', ProjectSchema)
let dbAvailable = false
const memoryStore = new Map()

function auth(req, res, next) {
	// Optional: simple token check via Authorization: Bearer <token>
	const header = req.headers.authorization || ''
	const token = header.startsWith('Bearer ') ? header.slice(7) : null
	if (!token) return next() // allow public for simplicity
	try {
		jwt.verify(token, process.env.JWT_SECRET || 'dev-secret')
		return next()
	} catch (e) {
		return res.status(401).json({ error: 'invalid token' })
	}
}

app.get('/health', (_req, res) => res.json({ ok: true }))

app.get('/projects/:projectId', auth, async (req, res) => {
    const { projectId } = req.params
    if (!dbAvailable) {
        const doc = memoryStore.get(projectId)
        if (!doc) return res.status(404).json({ error: 'not found' })
        return res.json(doc)
    }
    const doc = await Project.findOne({ projectId })
    if (!doc) return res.status(404).json({ error: 'not found' })
    res.json({ projectId, files: doc.files, activePath: doc.activePath })
})

app.post('/projects/:projectId', auth, async (req, res) => {
    const { projectId } = req.params
    const { files, activePath } = req.body || {}
    if (!files || typeof files !== 'object') return res.status(400).json({ error: 'files required' })
    if (!dbAvailable) {
        memoryStore.set(projectId, { projectId, files, activePath })
        return res.json({ projectId })
    }
    const updated = await Project.findOneAndUpdate(
        { projectId },
        { $set: { files, activePath } },
        { upsert: true, new: true }
    )
    res.json({ projectId: updated.projectId })
})

const MONGO_URI = process.env.MONGO_URI || ''
if (!MONGO_URI) {
	console.warn('No MONGO_URI provided; server will start without DB connection.')
}

async function start() {
    if (MONGO_URI) {
        try {
            await mongoose.connect(MONGO_URI)
            dbAvailable = true
            console.log('Mongo connected')
        } catch (e) {
            dbAvailable = false
            console.warn('Mongo connection failed, falling back to in-memory store. Reason:', e?.message)
        }
    }
	const port = process.env.PORT || 4000
	app.listen(port, () => console.log(`Server running on http://localhost:${port}`))
}

start().catch((e) => {
	console.error(e)
	process.exit(1)
})


