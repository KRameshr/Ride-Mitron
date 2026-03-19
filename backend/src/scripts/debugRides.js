import mongoose from 'mongoose';
const uri = "mongodb+srv://RideMitron:Ride31082000@cluster0.sniutqv.mongodb.net/RideMitronDB?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to DB");
    
    const db = mongoose.connection.db;
    const rides = db.collection('rides');
    
    const allRides = await rides.find({}).toArray();
    console.log(`Total rides found: ${allRides.length}`);
    
    allRides.forEach((r, i) => {
      console.log(`Ride ${i+1}:`);
      console.log(`  ID: ${r._id}`);
      console.log(`  Origin: ${r.origin.name} (${r.origin.location.coordinates})`);
      console.log(`  Dest: ${r.destination.name}`);
      console.log(`  Start: ${r.startTime}`);
      console.log(`  Status: ${r.status}`);
      console.log(`  Seats: ${r.availableSeats}/${r.totalSeats}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
