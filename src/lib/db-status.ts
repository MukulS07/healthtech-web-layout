import { createServerFn } from "@tanstack/react-start";
import { connectToDatabase, getConnectionStatus } from "./db";

/**
 * Server function to check MongoDB connection status.
 * Can be called from any component or loader.
 */
export const checkDbConnection = createServerFn({ method: "GET" }).handler(async () => {
  try {
    await connectToDatabase();
    const status = getConnectionStatus();
    return {
      success: true,
      status: status.state,
      isConnected: status.isConnected,
      message: "MongoDB connection is active and ready.",
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    const status = getConnectionStatus();
    return {
      success: false,
      status: status.state,
      isConnected: false,
      error: errMessage,
      message: "Unable to connect to MongoDB. Please verify MONGODB_URI.",
    };
  }
});
