// Question 15 (10 Marks): Analogy-based question: Imagine Express.js as a
// college administration office. A security desk logs requests and different
// departments handle student and course requests. Design an Express
// application with request logging, GET /students, GET /courses and a JSON
// 404 fallback. Explain the analogy.
// The logger is the security desk; each route is a department; the final
// fallback is the office directing unknown requests to the right place.
const express = require('express');
const app = express();

const students = [{ studentId: 'S101', name: 'Asha' }];
const courses = [{ courseId: 'CSE101', title: 'Programming' }];

// The security desk records the method and URL before routing the request.
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/students', (req, res) => {
  res.json(students);
});

app.get('/courses', (req, res) => {
  res.json(courses);
});

app.use((req, res) => {
  res.status(404).json({ message: 'Department or route not found' });
});

app.listen(3000, () => {
  console.log('College office running at http://localhost:3000');
});
