import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string;

if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const client: MongoClient = new MongoClient(uri);
const clientPromise: Promise<MongoClient> = client.connect();

export default clientPromise;
