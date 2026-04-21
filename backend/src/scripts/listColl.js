import mongoose from "mongoose";
const uri =
  "mongodb+srv://RideMitron:Ride31082000@cluster0.sniutqv.mongodb.net/RideMitronDB?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to DB");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(
      "Collections:",
      collections.map((c) => c.name),
    );

    for (let coll of collections) {
      const count = await db.collection(coll.name).countDocuments();
      console.log(`Collection: ${coll.name}, Count: ${count}`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
