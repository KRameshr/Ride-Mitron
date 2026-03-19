import mongoose from 'mongoose';

async function run() {
  const uri = "mongodb+srv://RideMitron:Ride31082000@cluster0.sniutqv.mongodb.net/RideMitronDB?retryWrites=true&w=majority&appName=Cluster0";
  try {
    console.log("Attempting to connect to MongoDB...");
    const conn = await mongoose.connect(uri);
    console.log("Connected Successfully.");
    
    const User = conn.connection.db.collection('users');
    const user = await User.findOne({ email: 'Pavan@gmail.com' });
    
    if (user) {
      console.log("Found User:", user.email, "Status:", user.status);
    } else {
      console.log("User 'Pavan@gmail.com' NOT FOUND in database.");
      const allUsers = await User.find({}).limit(5).toArray();
      console.log("Sample users in DB:", allUsers.map(u => u.email));
    }
    
    process.exit(0);
  } catch (err) {
    console.error("FATAL ERROR:", err.message);
    process.exit(1);
  }
}

run();
