import { MongoClient, Db } from "mongodb";

let db: Db;
let client: MongoClient;

export const connectDB = async (): Promise<Db> => {
  if (db) return db;

  client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();

  db = client.db(process.env.DB_NAME!);
  console.log("Admin service connected to MongoDB!");
  return db;
};
