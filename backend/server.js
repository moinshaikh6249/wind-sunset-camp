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

// Validate required environment variables at startup
const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET'];
if (process.env.NODE_ENV === 'production') {
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
			logger.error(`Missing required environment variable in production: ${varName}`);
      process.exit(1);
    }
  });
}

const app = express()
const server = createServer(app)
export let io = null

const defaultAllowedOrigins = process.env.NODE_ENV === 'production' ? [] : ["http://localhost:3000"]
const envOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || "")
	.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean)
const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envOrigins]))

const corsOptions = {
	origin: (origin, callback) => {
		if (!origin || allowedOrigins.includes(origin)) {
			callback(null, true)
			return
		}

		callback(new Error("Not allowed by CORS"))
	},
	credentials: true,
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
	optionsSuccessStatus: 204,
}

const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 300,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		message: "Too many requests. Please try again shortly.",
	},
})

const loginLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 10,
	skipSuccessfulRequests: true,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		message: "Too many failed login attempts. Please wait a minute and try again.",
	},
})

const messageLimiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	max: 20,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		message: "Too many messages from this IP. Please try again later.",
	},
})

const bookingLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		message: "Too many booking requests. Please try again later.",
	},
})

app.use(helmet())
app.use(cors(corsOptions))
app.use(compression())
app.use(express.json({ limit: "100kb" }))
app.use(express.urlencoded({ extended: true, limit: "100kb" }))
app.use(cookieParser())
app.use(sanitizeRequestInput)

app.use((req, res, next) => {
	const startedAt = Date.now()

	res.on("finish", () => {
		logger.info("HTTP request", {
			method: req.method,
			path: req.originalUrl,
			statusCode: res.statusCode,
			durationMs: Date.now() - startedAt,
			ip: req.ip,
		})
	})

	next()
})

app.use("/api/auth/login", loginLimiter)
app.use("/api/admin/login", loginLimiter)
app.use("/api/messages", messageLimiter)
app.use("/api", apiLimiter)
app.use("/api/bookings", bookingLimiter)

app.use((req, res, next) => {
	const originalJson = res.json.bind(res)

	res.json = (body) => {
		if (
			process.env.NODE_ENV !== "development" &&
			body &&
			typeof body === "object" &&
			"error" in body
		) {
			const { error, ...safeBody } = body
			return originalJson(safeBody)
		}

		return originalJson(body)
	}

	next()
})

app.use("/api", routes)

const startServer = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
		logger.info("MongoDB connected", { database: mongoose.connection.name })

		await createDefaultAdmin()

		io = new Server(server, {
			cors: {
				origin: allowedOrigins,
				credentials: true,
			},
		})

		io.on("connection", () => {
			logger.info("Admin connected to socket")
		})

		server.listen(process.env.PORT, () => {
			logger.info("Server running", { port: process.env.PORT })
		})
	} catch (err) {
		logger.error("Server startup failed", { error: err?.message || String(err) })
		process.exit(1)
	}
}

startServer()