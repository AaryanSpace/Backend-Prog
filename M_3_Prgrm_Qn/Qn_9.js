// Question 9 (5 Marks): Write Express.js code to create a GET route /students/
// that returns a JSON object containing the received student ID and a sample
// name. The ID is supplied as a route parameter, for example /students/S101.
const express = require('express');
const app = express();

// Read the student ID from the URL and return a sample student.
app.get('/students/:studentId', (req, res) => {
  res.json({
    studentId: req.params.studentId,
    name: 'Asha'
  });
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
