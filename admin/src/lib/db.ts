import mongoose from 'mongoose';

let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const MONGODB_URI = process.env.MONGO_URI;

        if (!MONGODB_URI) {
            throw new Error('Please define the MONGO_URI environment variable');
        }

        const opts = {
            bufferCommands: false,
            dbName: process.env.MONGO_DB_NAME || 'referearn',
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default connectDB;
