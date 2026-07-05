const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

async function migrateAdminId() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillmatrixai');
    console.log('✅ MongoDB Connected');

    // Get the default admin
    const defaultAdmin = await User.findOne({ email: 'admin@smarteval.ai' });
    if (!defaultAdmin) {
      console.error('❌ Default admin not found');
      process.exit(1);
    }
    console.log('✅ Default admin found:', defaultAdmin._id);

    // Update mentors without adminId
    const mentorsToUpdate = await User.find({ role: 'mentor', adminId: { $exists: false } });
    if (mentorsToUpdate.length > 0) {
      await User.updateMany(
        { role: 'mentor', adminId: { $exists: false } },
        { adminId: defaultAdmin._id }
      );
      console.log(`✅ Updated ${mentorsToUpdate.length} mentors with default admin ID`);
    } else {
      console.log('✅ All mentors already have adminId');
    }

    // Update students without adminId
    const studentsToUpdate = await User.find({ role: 'student', adminId: { $exists: false } });
    if (studentsToUpdate.length > 0) {
      await User.updateMany(
        { role: 'student', adminId: { $exists: false } },
        { adminId: defaultAdmin._id }
      );
      console.log(`✅ Updated ${studentsToUpdate.length} students with default admin ID`);
    } else {
      console.log('✅ All students already have adminId');
    }

    // Verify the migration
    const mentorsCount = await User.countDocuments({ role: 'mentor', adminId: { $exists: true } });
    const studentsCount = await User.countDocuments({ role: 'student', adminId: { $exists: true } });
    console.log(`\n📊 Migration Summary:`);
    console.log(`   Total mentors with adminId: ${mentorsCount}`);
    console.log(`   Total students with adminId: ${studentsCount}`);

    // Show sample data
    const sampleMentor = await User.findOne({ role: 'mentor' });
    const sampleStudent = await User.findOne({ role: 'student' });
    if (sampleMentor) console.log(`\n📋 Sample Mentor:`, { name: sampleMentor.name, adminId: sampleMentor.adminId });
    if (sampleStudent) console.log(`📋 Sample Student:`, { name: sampleStudent.name, adminId: sampleStudent.adminId });

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  }
}

migrateAdminId();
