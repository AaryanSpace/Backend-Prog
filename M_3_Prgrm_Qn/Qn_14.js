// Question 14 (10 Marks): Design a complete RESTful Student API for
// students. Implement GET all, GET one, POST, PUT and DELETE using an
// in-memory array. Use suitable status codes and handle missing records.
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

let nextId = 3;
const students = [
  { id: 1, name: 'Asha', course: 'CSE' },
  { id: 2, name: 'Ravi', course: 'ECE' }
];

app.get('/students', (req, res) => {
  res.status(200).json(students);
});

app.get('/students/:id', (req, res) => {
  const student = students.find((item) => item.id === Number(req.params.id));
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }
  res.status(200).json(student);
});

app.post('/students', (req, res) => {
  const { name, course } = req.body || {};
  if (typeof name !== 'string' || typeof course !== 'string') {
    return res.status(400).json({ message: 'name and course are required' });
  }

  const student = { id: nextId, name, course };
  nextId += 1;
  students.push(student);
  res.status(201).json(student);
});

app.put('/students/:id', (req, res) => {
  const student = students.find((item) => item.id === Number(req.params.id));
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const { name, course } = req.body;
  if (typeof name !== 'string' || typeof course !== 'string') {
    return res.status(400).json({ message: 'name and course are required' });
  }

  student.name = name;
  student.course = course;
  res.status(200).json(student);
});

app.delete('/students/:id', (req, res) => {
  const index = students.findIndex((item) => item.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Student not found' });
  }

  students.splice(index, 1);
  res.status(204).end();
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Student API running at http://localhost:${PORT}`);
});
