const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillmatrixai';

const users = [
  {
    name: 'Admin One',
    email: 'admin1@gmail.com',
    password: '123456789',
    role: 'admin'
  },
  {
    name: 'CN Mentor',
    email: 'cn@gmail.com',
    password: '123456789',
    role: 'mentor',
    adminEmail: 'admin1@gmail.com'
  },
  {
    name: 'Student One',
    email: 'stud@gmail.com',
    password: '123456789',
    role: 'student',
    mentorEmail: 'cn@gmail.com',
    adminEmail: 'admin1@gmail.com'
  },
  {
    name: 'Student Two',
    email: 'stud1@gmail.com',
    password: '123456789',
    role: 'student',
    mentorEmail: 'cn@gmail.com',
    adminEmail: 'admin1@gmail.com'
  }
];

async function run() {
  await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

  const created = [];

  for (const userData of users) {
    const existing = await User.findOne({ email: userData.email });
    if (existing) {
      console.log(`Skipping existing user: ${userData.email}`);
      continue;
    }

    const userPayload = {
      name: userData.name,
      email: userData.email,
      password: await bcrypt.hash(userData.password, 10),
      role: userData.role,
      department: 'General'
    };

    if (userData.role === 'mentor') {
      const admin = await User.findOne({ email: userData.adminEmail, role: 'admin' });
      if (!admin) {
        throw new Error(`Admin not found for mentor: ${userData.adminEmail}`);
      }
      userPayload.adminId = admin._id;
    }

    if (userData.role === 'student') {
      const mentor = await User.findOne({ email: userData.mentorEmail, role: 'mentor' });
      if (!mentor) {
        throw new Error(`Mentor not found for student: ${userData.mentorEmail}`);
      }
      userPayload.mentorId = mentor._id;
      userPayload.adminId = mentor.adminId;
      if (!userPayload.adminId) {
        const admin = await User.findOne({ email: userData.adminEmail, role: 'admin' });
        if (!admin) {
          throw new Error(`Admin not found for student: ${userData.adminEmail}`);
        }
        userPayload.adminId = admin._id;
      }
    }

    const createdUser = await User.create(userPayload);
    created.push(createdUser);
    console.log(`Created user: ${createdUser.email} (${createdUser.role})`);
  }

  console.log('Batch user creation complete.');
  created.forEach(u => console.log(`- ${u.email} as ${u.role}`));

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Batch creation failed:', err.message);
  process.exit(1);
});