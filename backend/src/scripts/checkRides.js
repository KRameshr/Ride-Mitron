import mongoose from "mongoose";
const uri =
  "mongodb+srv://RideMitron:Ride31082000@cluster0.sniutqv.mongodb.net/RideMitronDB?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to DB");

    const db = mongoose.connection.db;
    const rides = db.collection("rides");

    const allRides = await rides
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    console.log("Latest 5 rides:");
    allRides.forEach((r) => {
      console.log(
        `ID: ${r._id}, Origin: ${r.origin.name}, Destination: ${r.destination.name}, Start: ${r.startTime}, Status: ${r.status}, Coords: ${r.origin.location.coordinates}`,
      );
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
