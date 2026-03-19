import mongoose from 'mongoose';

async function run() {
  const uri = "mongodb+srv://RideMitron:Ride31082000@cluster0.sniutqv.mongodb.net/RideMitronDB?retryWrites=true&w=majority&appName=Cluster0";
  try {
    const conn = await mongoose.connect(uri);
    const users = await conn.connection.db.collection('users').find({}).toArray();
    const fs = await import('fs');
    fs.writeFileSync('users_db.json', JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (err) {
    process.exit(1);
  }
}

run();
