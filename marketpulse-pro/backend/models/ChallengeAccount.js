import mongoose from 'mongoose';

const challengeAccountSchema = new mongoose.Schema({
  accountName: {
    type: String,
    default: 'My Challenge Account'
  },
  startingBalance: {
    type: Number,
    default: 100000
  },
  currentBalance: {
    type: Number,
    default: 100000
  },
  status: {
    type: String,
    enum: ['Active', 'Passed', 'Failed'],
    default: 'Active'
  },
  // We can add rules like profitTarget or maxLoss here later
});

const ChallengeAccount = mongoose.model('ChallengeAccount', challengeAccountSchema);

export default ChallengeAccount;