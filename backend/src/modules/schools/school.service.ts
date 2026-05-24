import mongoose from 'mongoose';
import { School } from '../../database/models/School.model';
import { SchoolYear } from '../../database/models/SchoolYear.model';

function mapSchool(s: InstanceType<typeof School> & { _id: unknown }) {
  return {
    id: (s._id as mongoose.Types.ObjectId).toString(),
    name: s.name,
    schoolId: s.schoolId,
    division: s.division,
    district: s.district ?? '',
    address: s.address ?? '',
    isActive: s.isActive,
  };
}

export const schoolService = {
  async listAll() {
    const schools = await School.find({}).sort({ name: 1 }).lean();
    return schools.map((s) => ({
      id: (s._id as mongoose.Types.ObjectId).toString(),
      name: s.name,
      schoolId: s.schoolId,
      division: s.division,
      district: s.district ?? '',
      address: s.address ?? '',
      isActive: s.isActive,
    }));
  },

  async createSchool(data: {
    name: string;
    schoolId: string;
    division: string;
    district?: string;
    address?: string;
  }) {
    const existing = await School.findOne({ schoolId: data.schoolId });
    if (existing) {
      throw Object.assign(
        new Error(`School with DepEd ID "${data.schoolId}" already exists`),
        { statusCode: 409 },
      );
    }
    const school = await School.create(data);
    return mapSchool(school);
  },

  async updateSchool(
    id: string,
    data: Partial<{ name: string; schoolId: string; division: string; district: string; address: string }>,
  ) {
    const school = await School.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (!school) {
      throw Object.assign(new Error('School not found'), { statusCode: 404 });
    }
    return mapSchool(school);
  },

  async bulkCreateSchools(data: {
    division: string;
    district?: string;
    schools: Array<{ schoolId: string; name: string; address?: string }>;
  }) {
    const ids = data.schools.map((s) => s.schoolId);
    const existing = await School.find({ schoolId: { $in: ids } }, { schoolId: 1 }).lean();
    const existingSet = new Set(existing.map((e) => e.schoolId));

    const skipped: Array<{ schoolId: string; name: string; reason: string }> = [];
    const failed: Array<{ schoolId: string; name: string; reason: string }> = [];
    const toInsert: Array<{
      schoolId: string;
      name: string;
      address: string;
      division: string;
      district: string;
    }> = [];

    const seenInBatch = new Set<string>();
    for (const row of data.schools) {
      if (existingSet.has(row.schoolId)) {
        skipped.push({
          schoolId: row.schoolId,
          name: row.name,
          reason: 'DepEd ID already exists',
        });
        continue;
      }
      if (seenInBatch.has(row.schoolId)) {
        skipped.push({
          schoolId: row.schoolId,
          name: row.name,
          reason: 'Duplicate row in CSV',
        });
        continue;
      }
      seenInBatch.add(row.schoolId);
      toInsert.push({
        schoolId: row.schoolId,
        name: row.name,
        address: row.address ?? '',
        division: data.division,
        district: data.district ?? '',
      });
    }

    let created = 0;
    if (toInsert.length > 0) {
      try {
        const inserted = await School.insertMany(toInsert, { ordered: false });
        created = inserted.length;
      } catch (err) {
        const e = err as { insertedDocs?: unknown[]; writeErrors?: Array<{ index: number; errmsg?: string }> };
        created = e.insertedDocs?.length ?? 0;
        for (const we of e.writeErrors ?? []) {
          const row = toInsert[we.index];
          if (row) {
            failed.push({
              schoolId: row.schoolId,
              name: row.name,
              reason: we.errmsg ?? 'Insert failed',
            });
          }
        }
      }
    }

    return { created, skipped, failed };
  },


  async getById(id: string) {
    const school = await School.findById(id).lean();
    if (!school) {
      throw Object.assign(new Error('School not found'), { statusCode: 404 });
    }
    return {
      id:       (school._id as mongoose.Types.ObjectId).toString(),
      name:     school.name,
      schoolId: school.schoolId,
      division: school.division,
      district: school.district ?? '',
      address:  school.address ?? '',
      isActive: school.isActive,
    };
  },

  async updateInfo(
    id: string,
    data: { division?: string; district?: string; address?: string },
  ) {
    const school = await School.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (!school) {
      throw Object.assign(new Error('School not found'), { statusCode: 404 });
    }
    return mapSchool(school);
  },

  async getYears(schoolObjectId: string) {
    const years = await SchoolYear.find({ schoolId: schoolObjectId })
      .sort({ startDate: -1 })
      .lean();

    return years.map((y) => ({
      id: (y._id as mongoose.Types.ObjectId).toString(),
      schoolId: y.schoolId.toString(),
      label: y.label,
      startDate: y.startDate.toISOString().slice(0, 10),
      endDate: y.endDate.toISOString().slice(0, 10),
      isActive: y.isActive,
    }));
  },

  async createYear(
    schoolObjectId: string,
    data: { label: string; startDate: string; endDate: string },
  ) {
    const school = await School.findById(schoolObjectId);
    if (!school) {
      throw Object.assign(new Error('School not found'), { statusCode: 404 });
    }

    const year = await SchoolYear.create({
      schoolId: schoolObjectId,
      label: data.label,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      isActive: false,
    });

    return {
      id: (year._id as mongoose.Types.ObjectId).toString(),
      schoolId: year.schoolId.toString(),
      label: year.label,
      startDate: year.startDate.toISOString().slice(0, 10),
      endDate: year.endDate.toISOString().slice(0, 10),
      isActive: year.isActive,
    };
  },

  async updateYear(
    schoolObjectId: string,
    yearId: string,
    data: { label?: string; startDate?: string; endDate?: string },
  ) {
    const year = await SchoolYear.findOne({ _id: yearId, schoolId: schoolObjectId });
    if (!year) {
      throw Object.assign(new Error('School year not found'), { statusCode: 404 });
    }
    if (data.label     !== undefined) year.label     = data.label;
    if (data.startDate !== undefined) year.startDate = new Date(data.startDate);
    if (data.endDate   !== undefined) year.endDate   = new Date(data.endDate);
    await year.save();
    return {
      id:        (year._id as mongoose.Types.ObjectId).toString(),
      schoolId:  year.schoolId.toString(),
      label:     year.label,
      startDate: year.startDate.toISOString().slice(0, 10),
      endDate:   year.endDate.toISOString().slice(0, 10),
      isActive:  year.isActive,
    };
  },

  async deleteYear(schoolObjectId: string, yearId: string) {
    const year = await SchoolYear.findOne({ _id: yearId, schoolId: schoolObjectId });
    if (!year) {
      throw Object.assign(new Error('School year not found'), { statusCode: 404 });
    }
    if (year.isActive) {
      throw Object.assign(
        new Error('Cannot delete the active school year'),
        { statusCode: 409 },
      );
    }
    await year.deleteOne();
    return { id: yearId };
  },

  async activateYear(schoolObjectId: string, yearId: string) {
    const year = await SchoolYear.findOne({ _id: yearId, schoolId: schoolObjectId });
    if (!year) {
      throw Object.assign(new Error('School year not found'), { statusCode: 404 });
    }

    // deactivate all others for this school first
    await SchoolYear.updateMany({ schoolId: schoolObjectId }, { isActive: false });

    year.isActive = true;
    await year.save();

    return {
      id: (year._id as mongoose.Types.ObjectId).toString(),
      schoolId: year.schoolId.toString(),
      label: year.label,
      startDate: year.startDate.toISOString().slice(0, 10),
      endDate: year.endDate.toISOString().slice(0, 10),
      isActive: year.isActive,
    };
  },
};
