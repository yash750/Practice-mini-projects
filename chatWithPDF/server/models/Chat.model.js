import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  references: [String],
  context: String,
  contextData: [{
    id: Number,
    title: String,
    page: mongoose.Schema.Types.Mixed,
    content: String,
    preview: String
  }]
});

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UploadedFile',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  collectionName: {
    type: String,
    required: true
  },
  messages: [messageSchema]
}, {
  timestamps: true
});

// Index for efficient queries
chatSchema.index({ userId: 1, createdAt: -1 });
chatSchema.index({ fileId: 1 });

export default mongoose.model('Chat', chatSchema);