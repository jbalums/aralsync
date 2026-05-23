import mongoose from 'mongoose';
import { School } from '../../database/models/School.model';
import { SchoolYear } from '../../database/models/SchoolYear.model';

export const schoolService = {
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
