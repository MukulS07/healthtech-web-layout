import mongoose from "mongoose";

const MONGODB_URI = process.env["MONGODB_URI"] || "mongodb://localhost:27017/healthtech";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  uri?: string;
  isMemoryServer?: boolean;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Helper to dynamically attempt MongoMemoryServer if local port 27017 is refused.
 */
async function tryMemoryServer(): Promise<string | null> {
  try {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    console.log(" Started in-memory MongoDB instance at:", uri);
    return uri;
  } catch (e) {
    console.warn(" MongoMemoryServer not available or failed to start:", e);
    return null;
  }
}

/**
 * Connect to MongoDB database.
 * Uses cached connection in development / SSR serverless environments to prevent multiple connections.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const targetUri = process.env["MONGODB_URI"] || MONGODB_URI;
    const isVercel = Boolean(process.env["VERCEL"]);

    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    };

    cached.promise = (async () => {
      try {
        const maskedUri = targetUri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@");
        console.log(` Attempting MongoDB connection to: ${maskedUri}`);
        const m = await mongoose.connect(targetUri, opts);
        console.log(" Successfully connected to MongoDB database!");
        return m;
      } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : String(err);
        console.warn(` Standard MongoDB connection failed (${errMessage}).`);

        // Avoid MongoMemoryServer on Vercel or if explicit MONGODB_URI is provided
        const isDefaultLocalUri = targetUri.includes("localhost") || targetUri.includes("127.0.0.1");
        if (!isVercel && isDefaultLocalUri) {
          console.log(" Attempting MongoMemoryServer fallback...");
          const memoryUri = await tryMemoryServer();
          if (memoryUri) {
            cached.isMemoryServer = true;
            const m = await mongoose.connect(memoryUri, opts);
            console.log(" Successfully connected to In-Memory MongoDB!");
            return m;
          }
        }

        throw new Error(
          `Unable to connect to MongoDB (${errMessage}). Please verify MONGODB_URI in your environment variables or Vercel settings.`,
        );
      }
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

/**
 * Returns current MongoDB connection state string, connection URI info, and status boolean.
 */
export function getConnectionStatus(): {
  state: "disconnected" | "connected" | "connecting" | "disconnecting" | "uninitialized";
  isConnected: boolean;
  isMemoryServer?: boolean | undefined;
  currentUri?: string | undefined;
} {
  const readyState = mongoose.connection.readyState;
  const stateMap: Record<number, "disconnected" | "connected" | "connecting" | "disconnecting"> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const state = stateMap[readyState] || "uninitialized";
  return {
    state,
    isConnected: readyState === 1,
    isMemoryServer: cached.isMemoryServer,
    currentUri: process.env["MONGODB_URI"] || MONGODB_URI,
  };
}

export const connectDB = connectToDatabase;
export default connectToDatabase;
