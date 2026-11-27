// Question 11 (10 Marks): Develop an Express.js Student API using an
// in-memory array. Implement GET /students, GET /students/ and POST
// /students. Include JSON parsing and 404 handling.
// GET /students/:studentId is used for the single-student route intended by
// GET /students/; use, for example, /students/S101.
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// The array is reset whenever this server restarts.
const students = [
  { studentId: 'S101', name: 'Asha', course: 'CSE' },
  { studentId: 'S102', name: 'Ravi', course: 'ECE' }
];

app.get('/students', (req, res) => {
  res.json(students);
});

app.get('/students/:studentId', (req, res) => {
  const student = students.find((item) => item.studentId === req.params.studentId);
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }
  res.json(student);
});

app.post('/students', (req, res) => {
  const { studentId, name, course } = req.body || {};
  if (!studentId || !name || !course) {
    return res.status(400).json({ message: 'studentId, name, and course are required' });
  }

  const student = { studentId, name, course };
  students.push(student);
  res.status(201).json(student);
});

// Keep the fallback last so valid routes are checked first.
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Student API running at http://localhost:${PORT}`);
});
