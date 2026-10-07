import mongoose from "mongoose";

export const connectDB = async () => {
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error("MONGO_URL is not configured in the environment.");
  }

  try {
    const conn = await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      family: 4,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    const err = error as Error & {
      code?: string;
      reason?: unknown;
    };

    console.error("❌ MongoDB connection failed");
    console.error("Error:", err.message);
    console.error("Code:", err.code ?? "N/A");
    console.error("Name:", err.name ?? "N/A");

    process.exit(1);
  }
};
