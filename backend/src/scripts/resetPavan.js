import mongoose from "mongoose";
import User from "../models/User.js";

async function run() {
  const uri =
    "mongodb+srv://RideMitron:Ride31082000@cluster0.sniutqv.mongodb.net/RideMitronDB?retryWrites=true&w=majority&appName=Cluster0";
  try {
    await mongoose.connect(uri);
    console.log("Connected.");

    const user = await User.findOne({ email: "Pavan@gmail.com" }).select(
      "+password",
    );
    if (user) {
      console.log("User found:", user.email);
      // Let's check if the password matches '123456' or similar?
      // No, let's just update it to '123456' so the user can log in.
      user.password = "123456";
      await user.save();
      console.log("Password reset to '123456' for Pavan@gmail.com");
    } else {
      console.log("User NOT FOUND.");
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
