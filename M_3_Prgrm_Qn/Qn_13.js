// Question 13 (10 Marks): Explain the purpose of express.Router() and write
// code to create a student router with GET /students mounted from app.js.
// A Router groups related routes into a small, reusable route handler. Here,
// its GET / route is mounted at /students, making the full path /students.
const express = require('express');
const app = express();
const studentRouter = express.Router();

studentRouter.get('/', (req, res) => {
  res.json([{ studentId: 'S101', name: 'Asha', course: 'CSE' }]);
});

// Mount the student routes under the /students URL prefix.
app.use('/students', studentRouter);

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
