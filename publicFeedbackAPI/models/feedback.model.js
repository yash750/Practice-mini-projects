const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 1000
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    category: {
        type: String,
        enum: ['bug', 'feature', 'general', 'complaint'],
        default: 'general'
    }
});

module.exports = mongoose.model('Feedback', feedbackSchema);