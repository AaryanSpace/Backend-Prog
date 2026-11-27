// Question 12 (10 Marks): Analyze this code: a catch-all middleware sends
// 404 before the /students route. Explain why /students is not reached and
// correct the order.
// The catch-all responds to every request and does not call next(), so Express
// stops the request before it can reach the /students route. Put it last.
const express = require('express');
const app = express();

app.get('/students', (req, res) => {
  res.json([{ studentId: 'S101', name: 'Asha' }]);
});

// A 404 fallback belongs after every route that should be reachable.
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
