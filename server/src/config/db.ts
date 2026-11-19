import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    console.log("Checking MONGO_URI:", Boolean(process.env.MONGO_URI));

    const connection = await mongoose.connect(
      process.env.MONGO_URI as string
    );

    console.log(
      `MongoDB Connected: ${connection.connection.host}`
    );

  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;