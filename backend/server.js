import dotenv from "dotenv"
import { createServer } from "http"
import { Server } from "socket.io"
import path from "path"
import { fileURLToPath } from "url"
import mongoose from "mongoose"

import app from "./app.js"
import connectDB from "./config/database.js"
import { createDefaultAdmin } from "./utils/createDefaultAdmin.js"
import logger from "./utils/logger.js"
import { setIO } from "./utils/socket.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, ".env") })
dotenv.config({ path: path.resolve(__dirname, "../.env") })

const server = createServer(app)
export let io = null

const allowedOrigins = [
	"http://localhost:3000",
	"http://localhost:3001",
	process.env.FRONTEND_URL,
	process.env.CORS_ORIGINS,
].filter(Boolean)

const startServer = async () => {
	try {
		const conn = await connectDB().catch((err) => {
			logger.error("Initial MongoDB connection deferred", { error: err.message })
			return null
		})

		if (conn && mongoose.connection.readyState >= 1) {
			await createDefaultAdmin().catch((err) => {
				logger.error("Default admin creation skipped", { error: err.message })
			})
		}

		io = new Server(server, {
			cors: {
				origin: allowedOrigins,
				credentials: true,
			},
		})
		setIO(io)

		io.on("connection", () => {
			logger.info("Socket connected")
		})

		const port = process.env.PORT || 5000
		server.listen(port, () => {
			logger.info("Server running", { port })
		})
	} catch (err) {
		logger.error("Server startup encountered issue", { error: err.message })
	}
}

startServer()