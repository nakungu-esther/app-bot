const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    alertId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Alert',
        required: true
    },
    payload: {
        title: {
            type: String,
            required: true
        },
        body: {
            type: String,
            required: true
        },
        icon: String
    },
    sentAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['delivered', 'failed'],
        default: 'delivered'
    }
});

const Notification = mongoose.model('Notification', NotificationSchema);
module.exports = Notification;
