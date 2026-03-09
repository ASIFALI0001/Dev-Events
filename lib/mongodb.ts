import mongoose from 'mongoose';

// Define the type for the cached connection object
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Extend the global NodeJS namespace to include our mongoose cache
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

// Retrieve the MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Throw an error if the MongoDB URI is not defined in environment variables
if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global cache for the mongoose connection
 * In development, Next.js hot reloads can create multiple connections
 * This cache prevents connection exhaustion by reusing existing connections
 */
let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

// Store the cache in the global scope for development hot reload persistence
if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Establishes and returns a cached MongoDB connection using Mongoose
 * 
 * @returns Promise resolving to the Mongoose instance
 * 
 * How it works:
 * - First call: Creates a new connection and caches both the promise and connection
 * - Subsequent calls: Returns the cached connection or waits for pending connection
 * - Development: Reuses connections across hot reloads via global caching
 * - Production: Creates a single connection that persists during the app lifecycle
 */
async function connectDB(): Promise<typeof mongoose> {
  // If a connection already exists, return it immediately
  if (cached.conn) {
    return cached.conn;
  }

  // If there's no cached promise, create a new connection
  if (!cached.promise) {
    const options = {
      bufferCommands: false, // Disable mongoose buffering to fail fast if not connected
    };

    // Create a new connection promise and cache it
    cached.promise = mongoose.connect(MONGODB_URI, options).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      return mongoose;
    });
  }

  try {
    // Wait for the connection promise to resolve and cache the connection
    cached.conn = await cached.promise;
  } catch (error) {
    // Clear the promise cache on error to allow retry on next call
    cached.promise = null;
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }

  return cached.conn;
}

export default connectDB;
