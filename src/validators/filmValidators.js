
import zod from "zod"

const filmSchema = zod.object({
    title: zod.string()
        .trim()
        .min(1, "El título es obligatorio"),

    year: zod.coerce.number()
        .int("El año debe ser un número entero")
        .min(1888, "El año debe ser mayor o igual a 1888")
        .max(new Date().getFullYear(), `El año debe ser menor o igual a ${new Date().getFullYear()}`),

    genre: zod.enum([
        "Acción", "Aventuras", "Ciencia ficción",
        "Comedia", "Drama", "Terror", "Suspenso",
        "Thriller", "Romance", "Fantasía", "Musical",
        "Documental", "Western", "Bélico", "Animación",
        "Policial", "Histórico", "Biográfico", "Infantil",
        "Familiar", "Otros"
    ], {
        errorMap: () => ({
            message: "El género es obligatorio y debe ser uno de los valores permitidos"
        })
    })
})

export { filmSchema }
