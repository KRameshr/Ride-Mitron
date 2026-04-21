import mongoose from "mongoose";
const uri =
  "mongodb+srv://RideMitron:Ride31082000@cluster0.sniutqv.mongodb.net/RideMitronDB?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to DB");

    // We don't even need a schema if we use collection directly
    const db = mongoose.connection.db;
    const users = db.collection("users");

    const res = await users.deleteMany({
      $or: [{ email: "Pavani14@gmai.com" }, { phoneNumber: "9963998453" }],
    });

    console.log(`Deleted ${res.deletedCount} users.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
