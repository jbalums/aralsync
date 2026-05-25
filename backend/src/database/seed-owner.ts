import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB } from './connection';
import { User } from './models/User.model';
import { Role } from '../shared/types';
import mongoose from 'mongoose';

const OWNER_EMAIL = 'baluma.joel91@gmail.com';
const OWNER_NAME = 'Joel Baluma';
const OWNER_PASSWORD = 'sXZO7L^7d?K#*o(4';

async function seedOwner(): Promise<void> {
  await connectDB();

  const passwordHash = await bcrypt.hash(OWNER_PASSWORD, 12);

  const result = await User.findOneAndUpdate(
    { email: OWNER_EMAIL },
    {
      $set: {
        fullName: OWNER_NAME,
        role: Role.SUPER_ADMIN,
        passwordHash,
        isActive: true,
        employeeNumber: '',
        position: 'Platform Owner',
      },
      $setOnInsert: {
        devices: [],
        refreshTokens: [],
      },
    },
    { upsert: true, new: true },
  );

  console.log(`\n✓ Owner account ready`);
  console.log(`  Email : ${OWNER_EMAIL}`);
  console.log(`  Name  : ${OWNER_NAME}`);
  console.log(`  Role  : ${Role.SUPER_ADMIN}`);
  console.log(`  ID    : ${(result._id as mongoose.Types.ObjectId).toString()}\n`);

  await mongoose.disconnect();
}

seedOwner().catch((err: unknown) => {
  console.error('seed-owner failed:', err);
  process.exit(1);
});
