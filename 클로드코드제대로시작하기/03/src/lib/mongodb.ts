import { MongoClient } from 'mongodb';

let client: MongoClient | null = null;

export async function getClient() {
  if (client && client.isConnected()) return client;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Missing MONGODB_URI environment variable');
  }
  client = new MongoClient(uri);
  await client.connect();
  return client;
}
