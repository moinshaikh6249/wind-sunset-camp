import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import helmet from "helmet"
import compression from "compression"
import rateLimit from "express-rate-limit"
import cookieParser from "cookie-parser"

import routes from "./routes/index.js"
import { sanitizeRequestInput } from "./middleware/security.js"
import logger from "./utils/logger.js"

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// ✅ ENV CHECK
const requiredEnvVars = ["JWT_SECRET", "JWT_REFRESH_SECRET"]
if (process.env.NODE_ENV === "production") {
	requiredEnvVars.forEach((varName) => {
		if (!process.env[varName]) {
			logger.error(`Missing env variable: ${varName}`)
		}
	})
}

const app = express()

// ✅ CORS
const allowedOrigins = [
	"http://localhost:3000",
	"http://localhost:3001",
	process.env.FRONTEND_URL,
	process.env.CORS_ORIGINS,
].filter(Boolean)

app.use(
	cors({
		origin: (origin, cb) => {
			if (!origin || allowedOrigins.includes(origin) || process.env.VERCEL) return cb(null, true)
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
const isProdEnv = process.env.NODE_ENV === 'production';
app.use(
	"/api/auth/login",
	rateLimit({ windowMs: 60000, max: isProdEnv ? 10 : 1000, skipSuccessfulRequests: true })
)

app.use(
	"/api/admin/login",
	rateLimit({ windowMs: 60000, max: isProdEnv ? 10 : 1000, skipSuccessfulRequests: true })
)

app.use(
	"/api/messages",
	rateLimit({ windowMs: 60000, max: isProdEnv ? 15 : 1000 })
)

app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, max: isProdEnv ? 300 : 50000 }))

// ✅ ROOT ROUTE
app.get("/", (req, res) => {
	res.send("API is running 🚀")
})

// ✅ ROUTES
app.use("/api", routes)

export default app
