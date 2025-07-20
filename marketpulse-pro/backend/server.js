// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors()); // Allows cross-origin requests
app.use(express.json()); // Parses incoming JSON requests

// Basic route to test the server
app.get('/', (req, res) => {
  res.send('MarketPulse Pro Backend is running! 🚀');
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});