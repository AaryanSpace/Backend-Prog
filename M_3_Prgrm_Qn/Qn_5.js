// Question 5 (2 Marks): Write the Express.js statement that sends Welcome
// Students when a client sends a GET request to /welcome.
const express = require('express');
const app = express();

// Send the requested text for GET /welcome.
app.get('/welcome', (req, res) => {
  res.send('Welcome Students');
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});