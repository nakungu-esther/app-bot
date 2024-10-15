// Import packages
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const webPush = require('web-push');
const admin = require('firebase-admin');
const twilio = require('twilio');
const nodemailer = require('nodemailer');
const Notification = require('./models/notification'); // Import your Notification model
const Alert = require('./models/alert'); // Import your Alert model

// Load environment variables
require('dotenv').config();

// Create an Express app
const app = express();
let subscriptions = [];

// MongoDB connection string
const mongoURI = process.env.DATABASE_LOCAL; // Use the .env variable

// MongoDB connection function
const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected...');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit the process if there's an error
    }
};

// Use bodyParser middleware
app.use(bodyParser.json()); // for parsing application/json

// Initialize Firebase Admin
const initializeFirebase = () => {
    const serviceAccount = require('./firebase-adminsdk.json'); // Path to your service account key file
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
};

// Configure Web Push notifications
const configureWebPush = () => {
    const vapidKeys = {
        publicKey: 'BPHccnYHwVh2w_etN6cliXNoyW408qYTtGjqtmdSSH4qrvYRCzOel2fRhQP-biBQuMydKCEU5iPwfFysA-t6MvE', // Replace with your public VAPID key
        privateKey: 'nT7ofHgYwk4Pb1Hvr9oGSCmF3XGAc3zSbu2yvgVevlE', // Replace with your private VAPID key
    };

    webPush.setVapidDetails(
        'mailto:YOUR_EMAIL@example.com', // Replace with your email address
        vapidKeys.publicKey,
        vapidKeys.privateKey
    );
};

// Route to save subscription
app.post('/subscribe', (req, res) => {
    const subscription = req.body;

    // Validate subscription
    if (
        subscription &&
        subscription.keys &&
        subscription.keys.p256dh &&
        subscription.keys.auth &&
        Buffer.from(subscription.keys.p256dh, 'base64').length === 65 &&
        Buffer.from(subscription.keys.auth, 'base64').length === 16
    ) {
        subscriptions.push(subscription);
        console.log('New subscription added:', subscription);
        res.status(201).send('Subscription added');
    } else {
        console.error('Invalid subscription:', subscription);
        res.status(400).send('Invalid subscription');
    }
});

// Initialize Twilio Client with environment variables
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendNotification = (message) => {
    twilioClient.messages.create({
        body: message,
        from: '+19093231204', // Your Twilio phone number
        to: '+256760794900' // Replace with your phone number
    })
    .then((message) => console.log('SMS sent:', message.sid))
    .catch((error) => console.error('Error sending SMS:', error));
};

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service
    auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASSWORD // Your email password or app password
    }
});

const sendEmailNotification = (to, subject, text) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to, // Recipient's email
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log('Error sending email:', error);
        }
        console.log('Email sent:', info.response);
    });
};

const handleTradingViewAlert = async (alertData) => {
    // Log the alert data for debugging purposes
    console.log('Processing TradingView alert:', alertData);

    // Customize the message based on the alert data structure
    const message = `Alert received: Condition is ${alertData.condition} with value ${alertData.value}`;
    const emailSubject = 'New TradingView Alert';
    const emailText = `You have received a new alert:\nCondition: ${alertData.condition}\nValue: ${alertData.value}`;

    // Send SMS notification
    sendNotification(message);

    // Send Email notification
    sendEmailNotification(process.env.EMAIL_USER, emailSubject, emailText);

    // Send Web Push notifications
    sendWebPushNotification({ title: 'TradingView Alert', body: message });
};


// Function to send notifications to all subscriptions
const sendWebPushNotification = (data) => {
    const payload = JSON.stringify(data);

    subscriptions.forEach((subscription) => {
        webPush.sendNotification(subscription, payload)
            .then(response => console.log('Notification sent:', response))
            .catch(err => {
                console.error('Error sending notification:', err);

                // Remove the subscription if it's no longer valid
                if (err.statusCode === 410) {
                    console.log('Removing stale subscription:', subscription);
                    subscriptions = subscriptions.filter(sub => sub.endpoint !== subscription.endpoint);
                }
            });
    });
};

// Webhook endpoint for TradingView alerts
app.post('/webhook', async (req, res) => {
    const alertData = req.body; // Get the alert data from TradingView
    console.log('Received TradingView alert:', alertData);
    await handleTradingViewAlert(alertData); // Process the alert data
    res.status(200).send('Alert received');
});

// Start the Express server
const startServer = () => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Notification bot is running on port ${PORT}...`);
    });
};

// Main function to initialize and start the server
const main = async () => {
    await connectDB(); // Wait for DB connection
    initializeFirebase();
    configureWebPush();
    startServer();
};

// Run the main function
main();
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});
