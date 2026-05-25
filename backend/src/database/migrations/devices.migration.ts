import mongoose from 'mongoose';
import { User } from '../models/User.model';

/**
 * Convert legacy `deviceIds: string[]` into rich `devices` subdocs.
 * Idempotent and safe to remove once the legacy field is gone from all docs.
 */
export async function migrateDeviceIdsToDevices(): Promise<void> {
  const coll = mongoose.connection.collection('users');

  const cursor = coll.find({ deviceIds: { $exists: true, $ne: [] } });
  let migrated = 0;
  let cleared = 0;

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    if (!doc) break;

    const legacy = (doc['deviceIds'] as string[] | undefined) ?? [];
    const existing = ((doc['devices'] as Array<{ deviceId: string }> | undefined) ?? []).map(d => d.deviceId);

    const now = new Date();
    const toAdd = legacy
      .filter(id => id && !existing.includes(id))
      .map(id => ({
        deviceId:   id,
        name:       'Unknown device',
        type:       'other',
        userAgent:  '',
        createdAt:  now,
        lastSeenAt: now,
      }));

    const update: Record<string, unknown> = { $unset: { deviceIds: '' } };
    if (toAdd.length > 0) {
      update['$push'] = { devices: { $each: toAdd } };
      migrated += toAdd.length;
    }

    await coll.updateOne({ _id: doc['_id'] }, update);
    cleared += 1;
  }

  // Strip empty deviceIds arrays still hanging around.
  const stripped = await coll.updateMany(
    { deviceIds: { $exists: true } },
    { $unset: { deviceIds: '' } },
  );

  if (cleared > 0 || stripped.modifiedCount > 0 || migrated > 0) {
    console.log(
      `[migration] devices: converted ${migrated} legacy id(s) across ${cleared} user(s); stripped deviceIds from ${stripped.modifiedCount} more.`,
    );
  }

  // Ensure index exists (model defines it, but be explicit on first boot).
  try {
    await User.syncIndexes();
  } catch (err) {
    console.warn('[migration] devices: syncIndexes warning', err);
  }
}
