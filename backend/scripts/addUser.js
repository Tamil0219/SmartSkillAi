const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillmatrixai';

const args = process.argv.slice(2);
if (!args.length || args.includes('--help') || args.includes('-h')) {
  console.log(`Usage: node scripts/addUser.js <email> <password> <role> [name] [mentorEmail] [adminEmail]`);
  console.log(`  role: admin | mentor | student`);
  console.log(`  name: optional display name, defaults to email username`);
  console.log(`  mentorEmail: required for student if you want to assign a mentor`);
  console.log(`  adminEmail: required for mentor or student to assign an admin`);
  process.exit(0);
}

const [email, password, role, nameArg, mentorEmail, adminEmail] = args;
const name = nameArg || email.split('@')[0];

if (!email || !password || !role) {
  console.error('email, password, and role are required.');
  process.exit(1);
}

if (!['admin', 'mentor', 'student'].includes(role)) {
  console.error('Role must be admin, mentor, or student.');
  process.exit(1);
}

async function run() {
  await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

  const existing = await User.findOne({ email });
  if (existing) {
    console.error(`User with email ${email} already exists.`);
    process.exit(1);
  }

  let mentorId = null;
  let adminId = null;

  if (mentorEmail) {
    const mentor = await User.findOne({ email: mentorEmail, role: 'mentor' });
    if (!mentor) {
      console.error(`Mentor with email ${mentorEmail} not found.`);
      process.exit(1);
    }
    mentorId = mentor._id;
  }

  if (adminEmail) {
    const admin = await User.findOne({ email: adminEmail, role: 'admin' });
    if (!admin) {
      console.error(`Admin with email ${adminEmail} not found.`);
      process.exit(1);
    }
    adminId = admin._id;
  }

  if (role === 'mentor' && !adminId) {
    console.error('Mentor must be assigned an admin via adminEmail.');
    process.exit(1);
  }

  if (role === 'student') {
    if (!mentorId) {
      console.error('Student must be assigned a mentor via mentorEmail.');
      process.exit(1);
    }
    if (!adminId) {
      const mentor = await User.findById(mentorId);
      adminId = mentor.adminId;
      if (!adminId) {
        console.error('Mentor does not have an adminId. Provide adminEmail explicitly.');
        process.exit(1);
      }
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    mentorId,
    adminId
  });

  console.log('User created successfully:');
  console.log(`- id: ${user._id}`);
  console.log(`- name: ${user.name}`);
  console.log(`- email: ${user.email}`);
  console.log(`- role: ${user.role}`);

  await mongoose.disconnect();
}

run().catch((error) => {
  console.error('Error creating user:', error);
  process.exit(1);
});