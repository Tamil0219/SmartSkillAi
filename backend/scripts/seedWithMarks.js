// Script to seed database with sample data including marks
// Run from backend: node scripts/seedWithMarks.js

const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// MongoDB connection
const mongoURI = 'mongodb://127.0.0.1:27017/skillmatrixai';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
  seedDatabase();
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

const seedDatabase = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Create admin
    const adminPass = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPass,
      mobile: '9999999999',
      department: 'General',
      role: 'admin',
      marks: []
    });
    console.log('✅ Admin created');

    // Create mentors
    const mentorPass = await bcrypt.hash('mentor123', 10);
    const mentors = await User.insertMany([
      {
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh@example.com',
       password: mentorPass,
        mobile: '9876543210',
        department: 'Computer Science',
        role: 'mentor',
        marks: []
      },
      {
        name: 'Prof. Priya Singh',
        email: 'priya@example.com',
        password: mentorPass,
        mobile: '9876543211',
        department: 'Mathematics',
        role: 'mentor',
        marks: []
      },
      {
        name: 'Mr. Arun Patel',
        email: 'arun@example.com',
        password: mentorPass,
        mobile: '9876543212',
        department: 'Engineering',
        role: 'mentor',
        marks: []
      }
    ]);
    console.log(`✅ ${mentors.length} mentors created`);

    // Create students with marks
    const studentPass = await bcrypt.hash('student123', 10);
    const students = await User.insertMany([
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: studentPass,
        mobile: '9123456789',
        department: 'Computer Science',
        role: 'student',
        marks: [
          { examName: 'Math Quiz 1', score: 85, totalMarks: 100, date: new Date('2024-01-15') },
          { examName: 'Programming Midterm', score: 92, totalMarks: 100, date: new Date('2024-02-20') },
          { examName: 'Data Structures Final', score: 88, totalMarks: 100, date: new Date('2024-03-15') }
        ]
      },
      {
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: studentPass,
        mobile: '9123456790',
        department: 'Mathematics',
        role: 'student',
        marks: [
          { examName: 'Calculus Exam', score: 78, totalMarks: 100, date: new Date('2024-01-20') },
          { examName: 'Linear Algebra', score: 82, totalMarks: 100, date: new Date('2024-02-25') },
          { examName: 'Probability Quiz', score: 90, totalMarks: 100, date: new Date('2024-03-10') }
        ]
      },
      {
        name: 'Carol Williams',
        email: 'carol@example.com',
        password: studentPass,
        mobile: '9123456791',
        department: 'Engineering',
        role: 'student',
        marks: [
          { examName: 'Physics Midterm', score: 95, totalMarks: 100, date: new Date('2024-01-18') },
          { examName: 'Circuit Design', score: 91, totalMarks: 100, date: new Date('2024-02-22') },
          { examName: 'Mechanics Final', score: 93, totalMarks: 100, date: new Date('2024-03-12') }
        ]
      },
      {
        name: 'David Brown',
        email: 'david@example.com',
        password: studentPass,
        mobile: '9123456792',
        department: 'Computer Science',
        role: 'student',
        marks: [
          { examName: 'Web Development', score: 45, totalMarks: 100, date: new Date('2024-01-25') },
          { examName: 'Database Quiz', score: 48, totalMarks: 100, date: new Date('2024-02-28') },
          { examName: 'Backend Systems', score: 42, totalMarks: 100, date: new Date('2024-03-18') }
        ]
      },
      {
        name: 'Emma Davis',
        email: 'emma@example.com',
        password: studentPass,
        mobile: '9123456793',
        department: 'Mathematics',
        role: 'student',
        marks: [
          { examName: 'Advanced Math 1', score: 88, totalMarks: 100, date: new Date('2024-01-22') },
          { examName: 'Statistics Midterm', score: 91, totalMarks: 100, date: new Date('2024-02-26') },
          { examName: 'Topology Final', score: 89, totalMarks: 100, date: new Date('2024-03-14') }
        ]
      },
      {
        name: 'Frank Miller',
        email: 'frank@example.com',
        password: studentPass,
        mobile: '9123456794',
        department: 'Engineering',
        role: 'student',
        marks: [
          { examName: 'Thermodynamics', score: 76, totalMarks: 100, date: new Date('2024-01-19') },
          { examName: 'Materials Science', score: 72, totalMarks: 100, date: new Date('2024-02-24') },
          { examName: 'Manufacturing Midterm', score: 74, totalMarks: 100, date: new Date('2024-03-11') }
        ]
      },
      {
        name: 'Grace Lee',
        email: 'grace@example.com',
        password: studentPass,
        mobile: '9123456795',
        department: 'Computer Science',
        role: 'student',
        marks: [
          { examName: 'Algorithms', score: 93, totalMarks: 100, date: new Date('2024-01-21') },
          { examName: 'Operating Systems', score: 96, totalMarks: 100, date: new Date('2024-02-23') },
          { examName: 'Networking Final', score: 94, totalMarks: 100, date: new Date('2024-03-16') }
        ]
      },
      {
        name: 'Henry Wilson',
        email: 'henry@example.com',
        password: studentPass,
        mobile: '9123456796',
        department: 'Mathematics',
        role: 'student',
        marks: [
          { examName: 'Number Theory', score: 35, totalMarks: 100, date: new Date('2024-01-23') },
          { examName: 'Abstract Algebra', score: 40, totalMarks: 100, date: new Date('2024-02-27') },
          { examName: 'Set Theory Quiz', score: 38, totalMarks: 100, date: new Date('2024-03-13') }
        ]
      },
      {
        name: 'Iris Martinez',
        email: 'iris@example.com',
        password: studentPass,
        mobile: '9123456797',
        department: 'Engineering',
        role: 'student',
        marks: [
          { examName: 'Electrical Fundamentals', score: 87, totalMarks: 100, date: new Date('2024-01-17') },
          { examName: 'Power Systems', score: 85, totalMarks: 100, date: new Date('2024-02-21') },
          { examName: 'Control Systems Midterm', score: 90, totalMarks: 100, date: new Date('2024-03-09') }
        ]
      },
      {
        name: 'Jack Taylor',
        email: 'jack@example.com',
        password: studentPass,
        mobile: '9123456798',
        department: 'Computer Science',
        role: 'student',
        marks: [
          { examName: 'Mobile App Dev', score: 79, totalMarks: 100, date: new Date('2024-01-24') },
          { examName: 'Cloud Computing', score: 81, totalMarks: 100, date: new Date('2024-02-29') },
          { examName: 'DevOps Practices', score: 83, totalMarks: 100, date: new Date('2024-03-17') }
        ]
      }
    ]);
    console.log(`✅ ${students.length} students created with marks`);

    // Print summary
    console.log('\n📊 Sample Data Summary:');
    console.log(`   - Admins: 1`);
    console.log(`   - Mentors: ${mentors.length}`);
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Total Users: ${1 + mentors.length + students.length}`);
    console.log('\n🔐 Login Credentials:');
    console.log('   Admin:   admin@example.com / admin123');
    console.log('   Mentor:  rajesh@example.com / mentor123');
    console.log('   Student: alice@example.com / student123');
    console.log('\n💾 Sample data seeded successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};
