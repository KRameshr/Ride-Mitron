import mongoose from "mongoose";
const uri =
  "mongodb+srv://RideMitron:Ride31082000@cluster0.sniutqv.mongodb.net/RideMitronDB?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to DB");

    const db = mongoose.connection.db;
    const collection = db.collection("agzsessions");

    const indexes = await collection.indexes();
    console.log("Current indexes on agzsessions:");
    indexes.forEach((idx) => console.log(idx.name, JSON.stringify(idx.key)));

    // In Mongoose, { unique: true } on rideRequest field creates an index (usually named rideRequest_1)
    // The duplicate one was likely named rideRequest_1 as well, or just rideRequest_1 if created manually.
    // If there are multiple, Mongoose will warn.

    // Let's see if we can identify the duplicate.
    // If we have both rideRequest_1 and another one, we might need to drop one.

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
