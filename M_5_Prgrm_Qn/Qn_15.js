// Question 15 (10 Marks): Design an end-to-end Student Management flow that
// connects the earlier Express REST API idea to Mongoose and MongoDB. For
// POST /students, show the Mongoose schema/model, validate the request data,
// save the student, and return the created student. Also briefly explain the
// flow from UI request to MongoDB.
// Flow: the UI sends JSON -> Express parses and validates it -> Mongoose
// validates and saves the document -> Express returns the saved document.
const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  course: { type: String, required: true },
  marks: { type: Number, required: true, min: 0, max: 100 }
});

const Student = mongoose.model('Student', studentSchema);

app.post('/students', async (req, res, next) => {
  const { studentId, name, course, marks } = req.body || {};

  // Reject incomplete or wrongly typed data before creating a document.
  if (
    typeof studentId !== 'string' ||
    typeof name !== 'string' ||
    typeof course !== 'string' ||
    typeof marks !== 'number'
  ) {
    return res.status(400).json({
      message: 'studentId, name, course, and numeric marks are required'
    });
  }

  try {
    const student = await Student.create({ studentId, name, course, marks });
    res.status(201).json(student);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === 11000) {
      return res.status(409).json({ message: 'studentId already exists' });
    }
    next(error);
  }
});

// Report unexpected database or server errors explicitly.
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
});

async function startServer() {
  await mongoose.connect('mongodb://127.0.0.1:27017/collegeDB');
  app.listen(3000, () => {
    console.log('Student API running at http://localhost:3000');
  });
}

startServer().catch((error) => {
  console.error('Could not connect to MongoDB:', error);
  process.exitCode = 1;
});
