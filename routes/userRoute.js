// routes/register.js
const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Ensure this path is correct

// Route to register a new user
router.post('/register', async (req, res) => {
    const { email } = req.body;

    try {
        const newUser = new User({ email });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error('Error registering user:', error);
        if (error.code === 11000) { // Handle duplicate email
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
module.exports = router;