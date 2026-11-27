// Question 9 (5 Marks): Write a Mongoose schema for a Student with
// studentId, name, course, and marks. Make studentId and name required,
// studentId unique, and marks restricted to 0-100.
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  course: { type: String },
  marks: { type: Number, min: 0, max: 100 }
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
