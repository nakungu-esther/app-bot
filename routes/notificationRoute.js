const express = require('express');
const router = express.Router();
const Notification = require('../models/notification');

// Route to create a new notification
router.post('/notification', async (req, res) => {
    const { userId, alertId, title, body, icon } = req.body;

    try {
        const newNotification = new Notification({
            userId,
            alertId,
            payload: {
                title,
                body,
                icon,
            },
        });

        await newNotification.save();
        res.status(201).json({ message: 'Notification created successfully', notification: newNotification });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
