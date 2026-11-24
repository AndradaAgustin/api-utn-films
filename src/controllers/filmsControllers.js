
import { Film } from "../models/filmModel.js"
import { HTTP_MESSAGES } from "../constants/index.js"
import { successResponse, errorResponse } from "../utils/index.js"
import mongoose from "mongoose"
import { filmSchema } from "../validators/filmValidators.js"

// Filtrar películas
const filterFilms = async (req, res) => {
    try {
        const { title, genre, year, yearFrom, yearTo, results, offset } = req.query
        const filters = {}

        if (title) {
            filters.title = new RegExp(title, "i")
        }

        if (genre) {
            filters.genre = genre
        }

        if (year) {
            filters.year = Number(year)
        }

        if (yearFrom || yearTo) {
            filters.year = {}

            if (yearFrom) filters.year.$gte = Number(yearFrom)
            if (yearTo) filters.year.$lte = Number(yearTo)
        }

        const limit = results ? Number(results) : 0
        const skip = offset ? Number(offset) : 0

        const films = await Film.find(filters)
            .limit(limit)
            .skip(skip)
            .populate("createdBy", "name")

        return res.json(successResponse(films, "Películas filtradas con éxito"))
    } catch (error) {
        console.log(error)
        return res.status(500).json(errorResponse(HTTP_MESSAGES.getErrorFilms, error.message))
    }
}

// Obtener todas las películas
const getFilms = async (req, res) => {
    try {
        const films = await Film.find().populate("createdBy", "name")

        return res.json(successResponse(films, "Películas recuperadas con éxito"))
    } catch (error) {
        console.log(error)
        return res.status(500).json(errorResponse(HTTP_MESSAGES.getErrorFilms, error.message))
    }
}

// Crear película
const postFilm = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json(errorResponse("Usuario no autenticado"))
        }

        const validation = filmSchema.safeParse(req.body)

        if (!validation.success) {
            const errors = validation.error.issues.map(e => ({
                origin: e.path[0],
                message: e.message
            }))

            return res.status(400).json(errorResponse("Error de validación", errors))
        }

        const foundFilm = await Film.findOne({
            title: validation.data.title
        })

        if (foundFilm) {
            return res.status(409).json(errorResponse("La película ya existe en la base de datos"))
        }

        // Crear película y asociar usuario
        const newFilm = await Film.create({
            ...validation.data,
            createdBy: req.user.id
        })

        await newFilm.populate("createdBy", "name")

        return res.status(201).json(successResponse(newFilm, "Película creada exitosamente"))
    } catch (error) {
        console.log(error)

        if (error.name === "ValidationError") {
            return res.status(400).json(errorResponse("Error de validación de Mongoose", error.message))
        }

        if (error.code === 11000) {
            return res.status(409).json(errorResponse("La película ya existe en la base de datos"))
        }

        return res.status(500).json(errorResponse(HTTP_MESSAGES.createErrorFilm, error.message))
    }
}

// Actualizar película
const patchFilm = async (req, res) => {
    try {
        const { id } = req.params

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json(errorResponse("ID inválido, debería ser en formato ObjectId"))
        }

        const validation = filmSchema.partial().safeParse(req.body)

        if (!validation.success) {
            const errors = validation.error.issues.map(e => ({
                origin: e.path[0],
                message: e.message
            }))

            return res.status(400).json(errorResponse("Error de validación", errors))
        }

        // Permitir únicamente los campos editables
        const { title, year, genre } = validation.data
        const updates = {}

        if (title !== undefined) updates.title = title
        if (year !== undefined) updates.year = year
        if (genre !== undefined) updates.genre = genre

        if (Object.keys(updates).length === 0) {
            return res.status(400).json(errorResponse("Debes enviar al menos un campo para actualizar"))
        }

        if (updates.title) {
            const foundFilm = await Film.findOne({
                title: updates.title,
                _id: { $ne: id }
            })

            if (foundFilm) {
                return res.status(409).json(errorResponse("Ya existe otra película con ese título"))
            }
        }

        const updatedFilm = await Film.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        }).populate("createdBy", "name")

        if (!updatedFilm) {
            return res.status(404).json(errorResponse("La película no se encuentra en nuestra base de datos"))
        }

        return res.json(successResponse(updatedFilm, "Película actualizada con éxito"))
    } catch (error) {
        console.log(error)

        if (error.name === "ValidationError") {
            return res.status(400).json(errorResponse("Error de validación de Mongoose", error.message))
        }

        return res.status(500).json(errorResponse(HTTP_MESSAGES.patchErrorFilm, error.message))
    }
}

// Eliminar película
const deleteFilms = async (req, res) => {
    try {
        const { id } = req.params

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json(errorResponse("ID inválido, debería ser en formato ObjectId"))
        }

        const deletedFilm = await Film.findByIdAndDelete(id)

        if (!deletedFilm) {
            return res.status(404).json(errorResponse("La película no se encuentra en nuestra base de datos"))
        }

        return res.json(successResponse(deletedFilm, "Película borrada con éxito"))
    } catch (error) {
        console.log(error)
        return res.status(500).json(errorResponse("Disculpa, tuvimos un error, inténtalo en la brevedad...", error.message))
    }
}

export { filterFilms, getFilms, postFilm, patchFilm, deleteFilms }
