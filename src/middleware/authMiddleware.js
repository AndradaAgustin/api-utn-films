
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const authMiddleware = (req, res, next) => {
    try {
        const header = req.headers.authorization

        if (!header) {
            return res.status(401).json({ error: "Token requerido" })
        }

        const [scheme, token] = header.split(" ")

        if (scheme !== "Bearer" || !token) {
            return res.status(401).json({ error: "Formato de token inválido" })
        }

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // Guardar usuario autenticado
        req.user = decoded

        next()
    } catch (error) {
        console.error(error)

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Token inválido" })
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token vencido" })
        }

        return res.status(500).json({ error: "Internal server error" })
    }
}

export { authMiddleware }
