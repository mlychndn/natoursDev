const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a transporter
  const host = process.env.EMAIL_HOST;
  const port = process.env.EMAIL_PORT;
  const user = process.env.EMAIL_USERNAME;
  const pass = process.env.EMAIL_PASSWORD;

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      auth: {
        user,
        pass,
      },
      // Activate in gmail "less secure app" option
    });

    // 2) Define the email options
    // 3) actually send the email

    await transporter.sendMail(options);
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = sendEmail;
