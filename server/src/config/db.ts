import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export const connectDB = async (): Promise<boolean> => {
  if (isConnected) {
    return true;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 4000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection Warning: Could not connect to ${env.MONGODB_URI}.`);
    console.warn('   The server will continue in resilient memory/mock data fallback mode.');
    isConnected = false;
    return false;
  }
};

export const getDBStatus = (): { isConnected: boolean; host: string | null } => {
  return {
    isConnected: mongoose.connection.readyState === 1,
    host: mongoose.connection.host || null,
  };
};
