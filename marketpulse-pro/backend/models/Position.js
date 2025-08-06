import mongoose from 'mongoose';

const positionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  quantity: { type: Number, required: true },
  averagePrice: { type: Number, required: true }
});

// A user can only have one position per symbol
positionSchema.index({ user: 1, symbol: 1 }, { unique: true });

export default mongoose.model('Position', positionSchema);