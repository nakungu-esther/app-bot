// emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service
    auth: {
        user: 'your_email@example.com', // Your email
        pass: 'your_password', // Your email password
    },
});

const sendEmail = (subject, body) => {
    const mailOptions = {
        from: 'your_email@example.com',
        to: 'recipient@example.com',
        subject: subject,
        text: body,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(`Error: ${error}`);
        }
        console.log(`Email sent: ${info.response}`);
    });
};

module.exports = sendEmail;
