import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URL as string;
if (!uri) {
  throw new Error("MONGO_URL environment variable is required");
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

let cached = globalThis._mongoClient as MongoClient | undefined;

if (!cached) {
  cached = new MongoClient(uri);
  // @ts-ignore
  globalThis._mongoClient = cached;
}

export async function getDb(dbName = process.env.MONGO_DB || "metashift") {
  if (!cached) throw new Error("Mongo client not initialized");
  try {
    await cached.db("admin").command({ ping: 1 });
  } catch (e) {
    await cached.connect();
  }
  return cached.db(dbName);
}

export async function getClient() {
  if (!cached) throw new Error("Mongo client not initialized");
  try {
    await cached.db("admin").command({ ping: 1 });
  } catch (e) {
    await cached.connect();
  }
  return cached;
}
