const nodemailer = require('nodemailer');

// Create transporter using environment variables
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Email templates
const emailTemplates = {
  signup: (userName, userEmail) => ({
    subject: 'Welcome to Apothecary Shop!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5530;">Welcome to Apothecary Shop!</h2>
        <p>Hello ${userName},</p>
        <p>Thank you for registering with Apothecary Shop. Your account has been successfully created.</p>
        <p><strong>Account Details:</strong></p>
        <ul>
          <li>Name: ${userName}</li>
          <li>Email: ${userEmail}</li>
          <li>Role: Staff</li>
        </ul>
        <p>You can now access your account and start managing your pharmacy inventory.</p>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <br>
        <p>Best regards,<br>Apothecary Shop Team</p>
      </div>
    `
  }),

  signin: (userName, userEmail, loginTime) => ({
    subject: 'Successful Login - Apothecary Shop',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5530;">Login Alert</h2>
        <p>Hello ${userName},</p>
        <p>This is to notify you that your account was successfully accessed.</p>
        <p><strong>Login Details:</strong></p>
        <ul>
          <li>Email: ${userEmail}</li>
          <li>Time: ${loginTime}</li>
          <li>Status: Successful</li>
        </ul>
        <p>If this was not you, please contact our support team immediately and change your password.</p>
        <br>
        <p>Best regards,<br>Apothecary Shop Team</p>
      </div>
    `
  }),

  invalidCredentials: (email, attemptTime, ipAddress) => ({
    subject: 'Failed Login Attempt - Apothecary Shop',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">Security Alert</h2>
        <p>We detected a failed login attempt on your account.</p>
        <p><strong>Attempt Details:</strong></p>
        <ul>
          <li>Email: ${email}</li>
          <li>Time: ${attemptTime}</li>
          <li>IP Address: ${ipAddress || 'Unknown'}</li>
          <li>Status: Failed - Invalid Credentials</li>
        </ul>
        <p>If this was you and you're having trouble logging in, please use the "Forgot Password" feature or contact support.</p>
        <p>If this was not you, please change your password immediately and contact our support team.</p>
        <br>
        <p>Best regards,<br>Apothecary Shop Security Team</p>
      </div>
    `
  }),

  oauthSignin: (userName, userEmail, provider, loginTime) => ({
    subject: 'Successful Login via ${provider} - Apothecary Shop',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5530;">Login Alert</h2>
        <p>Hello ${userName},</p>
        <p>This is to notify you that your account was successfully accessed via ${provider}.</p>
        <p><strong>Login Details:</strong></p>
        <ul>
          <li>Email: ${userEmail}</li>
          <li>Provider: ${provider}</li>
          <li>Time: ${loginTime}</li>
          <li>Status: Successful</li>
        </ul>
        <p>If this was not you, please contact our support team immediately.</p>
        <br>
        <p>Best regards,<br>Apothecary Shop Team</p>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    const transporter = createTransporter();
    const emailContent = emailTemplates[template](...data);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Specific email functions for different events
const sendSignupEmail = async (userName, userEmail) => {
  return await sendEmail(userEmail, 'signup', [userName, userEmail]);
};

const sendSigninEmail = async (userName, userEmail, loginTime) => {
  return await sendEmail(userEmail, 'signin', [userName, userEmail, loginTime]);
};

const sendInvalidCredentialsEmail = async (email, attemptTime, ipAddress) => {
  return await sendEmail(email, 'invalidCredentials', [email, attemptTime, ipAddress]);
};

const sendOAuthSigninEmail = async (userName, userEmail, provider, loginTime) => {
  return await sendEmail(userEmail, 'oauthSignin', [userName, userEmail, provider, loginTime]);
};

module.exports = {
  sendSignupEmail,
  sendSigninEmail,
  sendInvalidCredentialsEmail,
  sendOAuthSigninEmail,
  sendEmail
};