/**
 * Bite Sense — MongoDB connection (Mongoose).
 */
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const dns = require('dns');

// Prioritize IPv4 DNS resolution to prevent querySrv errors on some systems
dns.setDefaultResultOrder('ipv4first');

let mongoServer = null;

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Copy .env.example to .env and fill it in.');
  }
  mongoose.set('strictQuery', true);

  try {
    console.log(`Connecting to MongoDB at ${uri}...`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    console.log(`  🗄️  MongoDB connected → ${mongoose.connection.name}`);
    return mongoose.connection;
  } catch (err) {
    console.log(`⚠️  Could not connect to MongoDB: ${err.message}`);
    console.log('🔄 Starting a local file-persisted MongoDB server as fallback...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      
      // Ensure data directory exists
      const dbPath = path.join(__dirname, '..', 'data', 'db');
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }
      
      mongoServer = await MongoMemoryServer.create({
        instance: {
          dbPath: dbPath,
          storageEngine: 'wiredTiger',
          startupTimeout: 60000, // 60 seconds to allow for binary extraction/startup on busy hosts
        }
      });
      
      const fallbackUri = mongoServer.getUri();
      console.log(`Fallback MongoDB server started at: ${fallbackUri}`);
      await mongoose.connect(fallbackUri, { serverSelectionTimeoutMS: 5000 });
      console.log(`  🗄️  MongoDB connected (Fallback) → ${mongoose.connection.name}`);
      return mongoose.connection;
    } catch (fallbackErr) {
      console.error('❌ Failed to start and connect to the fallback MongoDB server:', fallbackErr.message);
      throw err; // throw original connection error
    }
  }
}

module.exports = { connectDB, mongoose };

