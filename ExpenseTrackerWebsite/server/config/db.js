const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error("MONGODB_URI is not set");
        }
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    }
    catch(error){
        console.log("MongoDB connection error",error);
        process.exit(1);
    }

};
module.exports = connectDB;
