import mongoose from 'mongoose';

const journalEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  tradeType: { type: String, enum: ['Buy', 'Sell'], required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  notes: { type: String },
  tradeDate: { type: Date, default: Date.now }
});

export default mongoose.model('JournalEntry', journalEntrySchema);