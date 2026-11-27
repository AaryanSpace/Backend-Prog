// Question 7 (5 Marks): Write a basic Express.js application that responds
// with Hello, Express! at the root URL /. Also write the command to run it.
// Run with: node Qn_7.js (after installing Express).
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
