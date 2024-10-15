const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    condition: {
        type: String, // E.g., "price > 100"
        required: true
    },
    threshold: {
        type: Number,
        required: true
    },
    cronTime: {
        type: String, // E.g., "*/5 * * * *" for every 5 minutes
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

const Alert = mongoose.model('Alert', AlertSchema);
module.exports = Alert;
