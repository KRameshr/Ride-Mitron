import mongoose from "mongoose";

const uri =
  "mongodb+srv://RideMitron:Ride31082000@cluster0.sniutqv.mongodb.net/RideMitronDB?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(uri)
  .then(() => {
    console.log("Connected to DB");
    return mongoose.connection.db.collection("rides").find({}).toArray();
  })
  .then((rides) => {
    console.log("Rides count:", rides.length);
    rides.forEach((r) => {
      console.log(
        `- Origin: ${r.origin.name}, Destination: ${r.destination.name}, Time: ${r.startTime}`,
      );
    });
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
