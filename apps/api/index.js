const express = require('express');
const { db } = require('db');
const app = express();
const port = 3001;

app.get('/products', (req, res) => {
  res.json(db.products);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});