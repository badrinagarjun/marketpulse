import mongoose from 'mongoose';

const positionSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true // A user can only have one open position per symbol
  },
  quantity: {
    type: Number,
    required: true
  },
  averagePrice: {
    type: Number,
    required: true
  }
});

const Position = mongoose.model('Position', positionSchema);

export default Position;