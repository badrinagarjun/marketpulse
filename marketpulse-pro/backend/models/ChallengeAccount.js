import mongoose from 'mongoose';

const challengeAccountSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,  // Now required to link to specific user
    unique: true 
  },
  accountType: {
    type: String,
    enum: ['5k', '10k', '60k', '100k'],
    required: true
  },
  startingBalance: { 
    type: Number, 
    required: true 
  },
  currentBalance: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Active', 'Passed', 'Failed'], 
    default: 'Active' 
  },
}, { timestamps: true });

export default mongoose.model('ChallengeAccount', challengeAccountSchema);