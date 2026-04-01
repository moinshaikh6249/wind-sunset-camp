import { MongoClient, Db } from "mongodb";

const dbName = process.env.MONGODB_DB || process.env.MONGO_DB || "windcamp";

type GlobalMongo = typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error("Missing MongoDB URI. Set MONGODB_URI (or MONGO_URI) in your environment.");
  }
  return uri;
}

function getClientPromise(): Promise<MongoClient> {
  if (clientPromise) {
    return clientPromise;
  }

  const uri = getMongoUri();

  if (process.env.NODE_ENV === "development") {
    const globalMongo = globalThis as GlobalMongo;

    if (!globalMongo._mongoClientPromise) {
      client = new MongoClient(uri);
      globalMongo._mongoClientPromise = client.connect();
    }

    clientPromise = globalMongo._mongoClientPromise;
    return clientPromise;
  }

  client = new MongoClient(uri);
  clientPromise = client.connect();
  return clientPromise;
}

export async function getMongoDb(): Promise<Db> {
  const connectedClient = await getClientPromise();
  return connectedClient.db(dbName);
}
