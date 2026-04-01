import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import { createServer } from "http"
import { Server } from "socket.io"
import helmet from "helmet"
import compression from "compression"
import rateLimit from "express-rate-limit"
import cookieParser from "cookie-parser"

import routes from "./routes/index.js"
import { createDefaultAdmin } from "./utils/createDefaultAdmin.js"
import { sanitizeRequestInput } from "./middleware/security.js"
import logger from "./utils/logger.js"

dotenv.config()

// ✅ ENV CHECK
const requiredEnvVars = ["JWT_SECRET", "JWT_REFRESH_SECRET"]
if (process.env.NODE_ENV === "production") {
	requiredEnvVars.forEach((varName) => {
		if (!process.env[varName]) {
			logger.error(`Missing env variable: ${varName}`)
			process.exit(1)
		}
	})
}

const app = express()
const server = createServer(app)
export let io = null

// ✅ CORS
const allowedOrigins = [
	"http://localhost:3000",
	process.env.FRONTEND_URL,
	process.env.CORS_ORIGINS,
].filter(Boolean)

app.use(
	cors({
		origin: (origin, cb) => {
			if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
			cb(new Error("Not allowed by CORS"))
		},
		credentials: true,
	})
)

// ✅ SECURITY + MIDDLEWARE
app.use(helmet())
app.use(compression())
app.use(express.json({ limit: "100kb" }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(sanitizeRequestInput)

// ✅ LOGGING
app.use((req, res, next) => {
	const start = Date.now()
	res.on("finish", () => {
		logger.info("HTTP request", {
			method: req.method,
			path: req.originalUrl,
			status: res.statusCode,
			time: Date.now() - start,
		})
	})
	next()
})

// ✅ RATE LIMIT
app.use(
	"/api/auth/login",
	rateLimit({ windowMs: 60000, max: 10, skipSuccessfulRequests: true })
)

app.use(
	"/api/admin/login",
	rateLimit({ windowMs: 60000, max: 10, skipSuccessfulRequests: true })
)

app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }))

// ✅ ROOT ROUTE (IMPORTANT FIX)
app.get("/", (req, res) => {
	res.send("API is running 🚀")
})

// ✅ ROUTES
app.use("/api", routes)

// ✅ START SERVER
const startServer = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI)
		logger.info("MongoDB connected")

		await createDefaultAdmin()

		io = new Server(server, {
			cors: {
				origin: allowedOrigins,
				credentials: true,
			},
		})

		io.on("connection", () => {
			logger.info("Socket connected")
		})

		server.listen(process.env.PORT || 10000, () => {
			logger.info("Server running", { port: process.env.PORT || 10000 })
		})
	} catch (err) {
		logger.error("Startup failed", { error: err.message })
		process.exit(1)
	}
}

startServer()