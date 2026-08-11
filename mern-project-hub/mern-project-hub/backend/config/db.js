import mongoose from "mongoose";

// MongoDB Atlas connection - works identically in dev and production,
// since Atlas is already a hosted/cloud database. Just point MONGO_URI
// at your cluster and make sure Network Access allows your host's IP.
const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB Atlas connected: ${conn.connection.host}`);

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err.message);
    });
    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected - Mongoose will attempt to reconnect");
    });
  } catch (err) {
    console.error(`MongoDB initial connection failed: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
