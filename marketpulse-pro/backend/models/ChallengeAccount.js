import mongoose from 'mongoose';

const challengeAccountSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  startingBalance: { type: Number, default: 100000 },
  currentBalance: { type: Number, default: 100000 },
  status: { type: String, enum: ['Active', 'Passed', 'Failed'], default: 'Active' },
});

export default mongoose.model('ChallengeAccount', challengeAccountSchema);