const nodemailer = require('nodemailer');

// Create a transporter object
const transporter = nodemailer.createTransport({
  service: 'gmail', // e.g., 'Gmail', 'Yahoo', etc.
  auth: {
    user: 'ashwin46kumar@gmail.com',
    pass: 'Ashwin0605',
  },
});

// Email data
const mailOptions = {
  from: 'ashwin46kumar@gmail.com',
  to: 'balamuruganm7312@gmail.com',
  subject: 'Testing Nodemailer',
  text: 'Hello from Nodemailer!',
};

// Send the email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error sending email:', error);
  } else {
    console.log('Email sent:', info.response);
  }
});

