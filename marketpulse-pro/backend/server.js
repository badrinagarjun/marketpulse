// backend/server.js
import 'dotenv/config'; // Updated dotenv import
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// --- Connect to MongoDB ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connection established successfully."))
  .catch((err) => console.error("MongoDB connection error:", err));

// Basic route to test the server
app.get('/', (req, res) => {
  res.send('MarketPulse Pro Backend is running! 🚀');
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});