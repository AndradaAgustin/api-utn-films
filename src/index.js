import dns from "node:dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express from "express"
import cors from "cors"
import nodemailer from "nodemailer";
import { filmsRouter } from "./routes/filmsRouter.js"
import { usersRouter } from "./routes/usersRouter.js"
import { connectMongoDb } from "./config/connectMongoDb.js"
import { authMiddleware } from "./middleware/authMiddleware.js"
import dotenv from "dotenv"
dotenv.config()

const PORT = process.env.PORT
const URI_DB = process.env.URI_DB || process.env.URI_LOCAL_DB
const GMAIL_USER = process.env.GMAIL_USER
const GMAIL_PASS = process.env.GMAIL_PASS

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS
    }
})

const sendErrorEmail = async (err, req) => {
  await transporter.sendMail({
    from: '"Alertas API" <api-utn-films>',
    to: GMAIL_USER,
    subject: `❌ Error en la API: ${err.message}`,
    html: `
      <h2>Se detecto un error</h2>
      <p><b>Fecha:</b> ${new Date().toLocaleString("es-AR")}</p>
      <p><b>Ruta:</b>${req.method} ${req.originalUrl}</p>
      <p><b>Mensaje:</b>${err.message}</p>
      <pre>${err.stack}</pre>
      `
  })
  }

  const errorMailMiddleware = (err, req, res, next) => {
    console.log(err)

    sendErrorEmail(err, req).catch(mailError => {
      console.error("No se pudo enviar ell email de error", mailError.message)
    })

    if(res.headersSent) return next(err)

    res.status(err.status || 500).json({ error: "Error interno del servidor" })
    }

const app = express()
app.use(express.json())
app.use(cors())

app.get("/", (req, res) => {
  try {
    res.json({
      status: {
        ok: true,
        description: "All Systems Operational"
      }
    })
  } catch (error) {
    res.status(500).json({ error: "Nuestros servicios están caidos" })
  }
})

// http://localhost:3000/users/login
app.use("/films", authMiddleware, filmsRouter)
app.use("/users", usersRouter)

app.use(errorMailMiddleware)

app.use("", (req, res) => {
  res.status(404).json({ message: "No se encuentra el recurso" })
})

app.listen(PORT, () => {
  connectMongoDb(URI_DB)
  console.log(`Servidor en escucha por el puerto http://localhost:${PORT}`)
})