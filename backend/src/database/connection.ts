import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }
  await mongoose.connect(uri);
  console.log('MongoDB connected');

  // One-shot migration: rename legacy `middleInitial` → `middleName` on students
  try {
    const db = mongoose.connection.db;
    if (db) {
      const result = await db.collection('students').updateMany(
        { middleInitial: { $exists: true } },
        [
          { $set: { middleName: '$middleInitial' } },
          { $unset: 'middleInitial' },
        ],
      );
      if (result.modifiedCount > 0) {
        console.log(`Migrated ${result.modifiedCount} student docs: middleInitial → middleName`);
      }
    }
  } catch (err) {
    console.error('middleName migration failed:', err);
  }
}
