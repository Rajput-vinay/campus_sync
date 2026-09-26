import mongoose from "mongoose";
import Institute from "../models/institute.ts";
import User, { UserRole } from "../models/user.ts";
import Trade from "../models/trade.ts";
import Subject from "../models/subject.ts";
import AcademicYear from "../models/academicYear.ts";
import Timetable from "../models/timetable.ts";
import Attendance from "../models/attendance.ts";
import Exam from "../models/exam.ts";
import Room from "../models/room.ts";
import HostelApplication from "../models/hostel.ts";
import Maintenance from "../models/maintenance.ts";
import Submission from "../models/submission.ts";
import ActivitiesLog from "../models/activitieslog.ts";
import HostelBuilding from "../models/hostelBuilding.ts";

export const seedAndMigrateDatabase = async () => {
  try {
    console.log("🔄 Starting database initialization & multi-tenant migration...");

    let defaultInstitute = await Institute.findOne({ code: "NSTI-KANPUR" });

    if (!defaultInstitute) {
      defaultInstitute = await Institute.create({
        name: "National Skill Training Institute, Kanpur",
        code: "NSTI-KANPUR",
        location: "Kanpur, Uttar Pradesh",
        address: "NSTI Campus, Udyog Nagar, Kanpur - 208022",
        contactEmail: "nsti-kanpur@dgt.gov.in",
        contactPhone: "0512-2296066",
        logoUrl: "/nsti-kanpur-logo.png",
        isActive: true,
      });
      console.log(`✅ Default Institute created: ${defaultInstitute.name} (${defaultInstitute.code})`);
    } else {
      console.log(`ℹ️ Default Institute found: ${defaultInstitute.name} (${defaultInstitute.code})`);
    }

    const defaultInstId = defaultInstitute._id;

    const modelsToMigrate = [
      { name: "Trade", model: Trade, query: { institute: { $exists: false } } },
      { name: "Subject", model: Subject, query: { institute: { $exists: false } } },
      { name: "AcademicYear", model: AcademicYear, query: { institute: { $exists: false } } },
      { name: "Timetable", model: Timetable, query: { institute: { $exists: false } } },
      { name: "Attendance", model: Attendance, query: { institute: { $exists: false } } },
      { name: "Exam", model: Exam, query: { institute: { $exists: false } } },
      { name: "Room", model: Room, query: { institute: { $exists: false } } },
      { name: "HostelApplication", model: HostelApplication, query: { institute: { $exists: false } } },
      { name: "Maintenance", model: Maintenance, query: { institute: { $exists: false } } },
      { name: "Submission", model: Submission, query: { institute: { $exists: false } } },
      { name: "ActivitiesLog", model: ActivitiesLog, query: { institute: { $exists: false } } },
    ];

    for (const item of modelsToMigrate) {
      const model = item.model as any;
      const count = await model.countDocuments(item.query);
      if (count > 0) {
        console.log(`🚜 Migrating ${count} records for model '${item.name}'...`);
        await model.updateMany(item.query, { $set: { institute: defaultInstId } });
        console.log(`✅ Successfully migrated ${item.name} records.`);
      }
    }

    const userCount = await User.countDocuments({
      role: { $ne: UserRole.SUPER_ADMIN },
      institute: { $exists: false }
    });
    if (userCount > 0) {
      console.log(`🚜 Migrating ${userCount} User records...`);
      await User.updateMany(
        { role: { $ne: UserRole.SUPER_ADMIN }, institute: { $exists: false } },
        { $set: { institute: defaultInstId } }
      );
      console.log(`✅ Successfully migrated User records.`);
    }

    const hostelCount = await HostelBuilding.countDocuments({ institute: { $exists: false } });
    if (hostelCount > 0) {
      await HostelBuilding.updateMany({ institute: { $exists: false } }, { $set: { institute: defaultInstId } });
      console.log(`✅ Migrated ${hostelCount} Hostel records to default institute.`);
    }

    let defaultBoysHostel = await HostelBuilding.findOne({ name: "Boys Hostel A", institute: defaultInstId });
    if (!defaultBoysHostel) {
      defaultBoysHostel = await HostelBuilding.create({
        name: "Boys Hostel A",
        category: "Boys Hostel",
        institute: defaultInstId,
      });
      console.log("✅ Default Boys Hostel created.");
    }

    const roomsMissingHostel = await Room.countDocuments({ hostel: { $exists: false } });
    if (roomsMissingHostel > 0) {
      await Room.updateMany({ hostel: { $exists: false } }, { $set: { hostel: defaultBoysHostel._id } });
      console.log(`✅ Migrated ${roomsMissingHostel} Room records to default Boys Hostel.`);
    }

    let superAdmin = await User.findOne({ role: UserRole.SUPER_ADMIN });

    if (!superAdmin) {
      superAdmin = await User.create({
        name: "Central Super Administrator",
        email: "superadmin@nsti.gov.in",
        password: "superadmin123",
        role: UserRole.SUPER_ADMIN,
        isActive: true,
      });
      console.log(`👑 Created default Central Super Admin: ${superAdmin.email}`);
    } else {
      console.log("👑 Central Super Admin is already present.");
    }

    // Public demo accounts. The User model hashes passwords automatically.
    const demoAccounts = [
      {
        name: "Demo Student",
        email: "demo.student@nsti.gov.in",
        password: "Demo@123456",
        role: UserRole.STUDENT,
        institute: defaultInstId,
        isActive: true,
      },
      {
        name: "Demo Admin",
        email: "demo.admin@nsti.gov.in",
        password: "Demo@123456",
        role: UserRole.ADMIN,
        institute: defaultInstId,
        isActive: true,
      },
    ];

    for (const demo of demoAccounts) {
      const existingDemo = await User.findOne({ email: demo.email });
      if (!existingDemo) {
        await User.create(demo);
        console.log(`🧪 Created demo account: ${demo.email}`);
      }
    }

    console.log("🎉 Database initialization & migration completed successfully!");
  } catch (error) {
    console.error("❌ Database initialization & migration failed:", error);
  }
};