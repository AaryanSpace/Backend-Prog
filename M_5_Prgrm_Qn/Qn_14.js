// Question 14 (10 Marks): Create a Mongoose-based Student Management
// program in Node.js. It must connect to collegeDB, define a Student schema
// with validation, create the model, insert one student, read students with
// marks >= 80, and disconnect from MongoDB. Use ES module syntax as shown in
// the module.
// Run with: node Qn_14.js (after installing Mongoose and starting MongoDB).
import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  course: { type: String, required: true },
  marks: { type: Number, required: true, min: 0, max: 100 }
});

const Student = mongoose.model('Student', studentSchema);

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/collegeDB');

  try {
    // Create one student, then read students who scored at least 80.
    const createdStudent = await Student.create({
      studentId: 'S201',
      name: 'Kiran',
      course: 'CSE',
      marks: 88
    });
    console.log('Created student:', createdStudent);

    const highScoringStudents = await Student.find({ marks: { $gte: 80 } });
    console.log('Students with marks >= 80:', highScoringStudents);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error('Student management failed:', error);
  process.exitCode = 1;
});
