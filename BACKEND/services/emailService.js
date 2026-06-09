const nodemailer = require('nodemailer');

/**
 * Send an email with SMTP configuration or mock console log in development
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.text] - Plain text fallback
 */
const sendEmail = async (options) => {
  // If SMTP environment variables aren't provided, print to console as fallback
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('\n✉️ ────────── MOCK EMAIL SENT ──────────');
    console.log(`To:      ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log('Body:');
    // Simple regex to extract the OTP from HTML to make it clear in console
    const otpMatch = options.html.match(/letter-spacing:\s*5px;[^>]*>\s*([0-9]{6})\s*<\/span>/);
    if (otpMatch) {
      console.log(`\n👉 Reset password OTP: ${otpMatch[1]}\n`);
    } else {
      console.log(options.text || options.html);
    }
    console.log('───────────────────────────────────────\n');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'ExamGen AI Pro'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.text || 'Reset your password with OTP',
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
