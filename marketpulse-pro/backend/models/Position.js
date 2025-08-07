import mongoose from 'mongoose';

const positionSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true  // Now required to link to specific user
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true
  },
  quantity: {
    type: Number,
    required: true
  },
  averagePrice: {
    type: Number,
    required: true
  }
}, { timestamps: true });

export default mongoose.model('Position', positionSchema);