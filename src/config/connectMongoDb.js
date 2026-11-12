import mongoose from "mongoose";

const connectMongoDb = async (uri) => {
    try {
        await mongoose.connect(uri);
        console.log("Conectado a MongoDB");
    } catch (error) {
        console.error("No se pudo conectar a MongoDB:");
        console.error(error);
    }
};

export { connectMongoDb };