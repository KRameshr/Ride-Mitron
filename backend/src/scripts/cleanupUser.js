import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const email = "Pavani14@gmai.com";
    const phone = "9963998453";

    const User = mongoose.model(
      "User",
      new mongoose.Schema({
        email: String,
        phoneNumber: String,
      }),
    );

    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber: phone }],
    });

    if (existingUser) {
      console.log("Found existing user:", existingUser);
      await User.deleteOne({ _id: existingUser._id });
      console.log("Deleted existing user to allow clean signup.");
    } else {
      console.log("No user found with those details.");
    }

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

checkUser();
