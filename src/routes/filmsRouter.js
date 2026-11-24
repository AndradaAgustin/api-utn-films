
import { Router } from "express"
import { deleteFilms, filterFilms, getFilms, patchFilm, postFilm } from "../controllers/filmsControllers.js"

const filmsRouter = Router()

// Rutas de películas
filmsRouter.get("/search", filterFilms)
filmsRouter.get("/", getFilms)
filmsRouter.post("/", postFilm)
filmsRouter.patch("/:id", patchFilm)
filmsRouter.delete("/:id", deleteFilms)

export { filmsRouter }
