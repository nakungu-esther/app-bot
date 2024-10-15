// insertData.js
const mongoose = require('mongoose');
const Alert = require('./models/alert'); // Adjust the path as necessary
require('dotenv').config(); // Load environment variables

const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB with URI:', process.env.DATABASE_LOCAL); // Log the connection string
        await mongoose.connect(process.env.DATABASE_LOCAL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected...');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

const insertSampleData = async () => {
    const alert = new Alert({
        userId: 'your_user_id_here', // Replace with an actual user ID from your User collection
        title: 'Price Alert',
        body: 'The price has exceeded your threshold.',
        condition: 'price > 100',
        threshold: 100,
        cronTime: '*/5 * * * *', // Every 5 minutes
        isActive: true
    });

    try {
        await alert.save();
        console.log('Sample alert inserted.');
    } catch (err) {
        console.error('Error inserting alert:', err);
    }
};

const main = async () => {
    await connectDB();
    await insertSampleData();
    mongoose.connection.close(); // Close the connection after the operation
};

main();
