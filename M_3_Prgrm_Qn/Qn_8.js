// Question 8 (5 Marks): Explain middleware in Express.js. Write middleware
// that logs the HTTP method and URL and then passes control to the next handler.
// Middleware is a function that runs during the request-response cycle. Calling
// next() passes the request to the next middleware or route handler.
const express = require('express');
const app = express();

// Log each request, then allow Express to continue.
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.send('Request logged.');
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
