
import mongoose from "mongoose"

const filmSchema = new mongoose.Schema({
    title: { type: String, required: true },
    year: { type: Number, required: true },
    genre: { type: String, default: "generica" },

    // Usuario que agregó la película
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }
}, {
    versionKey: false
})

const Film = mongoose.model("Film", filmSchema)

export { Film }
