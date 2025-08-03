import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import stockRoutes from './routes/stockRoutes.js';
import journalRoutes from './routes/journalRoutes.js';
import challengeRoutes from './routes/challengeRoutes.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// --- API Routes ---
app.use('/api/stock', stockRoutes);

// Basic route to test the server
app.get('/', (req, res) => {
  res.send('MarketPulse Pro Backend is running! 🚀');
});

app.use('/api/stock', stockRoutes);
app.use('/api/journal', journalRoutes); // Use journal routes

app.use('/api/journal', journalRoutes);
app.use('/api/challenge', challengeRoutes); // Use challenge routes

app.use('/api/stock', stockRoutes);
app.use('/api/challenge', challengeRoutes);


// --- Connect to MongoDB and start server ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connection established successfully.");
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));