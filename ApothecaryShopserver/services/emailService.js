const nodemailer = require('nodemailer');

// TODO: Install validator package for more robust email validation
// npm install validator
// const validator = require('validator');

// Singleton transporter
let transporter = null;

// Helper function to get transporter
const getTransporter = () => {
  // Check required environment variables at startup
  if (!process.env.EMAIL_USER) {
    throw new Error('EMAIL_USER environment variable is required');
  }
  if (!process.env.EMAIL_PASS) {
    throw new Error('EMAIL_PASS environment variable is required');
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return transporter;
};

// More robust email validation function
const isValidEmail = (email) => {
  if (typeof email !== 'string') return false;
  
  // More comprehensive email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254; // Email addresses shouldn't exceed 254 characters
};

// HTML escaping function to sanitize user input
const escapeHtml = (unsafe) => {
  if (typeof unsafe !== 'string') return String(unsafe);
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Rate limiting implementation
const rateLimiter = new Map();

const isRateLimited = (recipient) => {
  const now = Date.now();
  const windowMs = 60000; // 1 minute window
  const maxRequests = 5; // Max 5 emails per minute
  
  if (!rateLimiter.has(recipient)) {
    rateLimiter.set(recipient, {
      count: 1,
      firstRequest: now
    });
    return false;
  }
  
  const record = rateLimiter.get(recipient);
  
  // Reset if window has passed
  if (now - record.firstRequest > windowMs) {
    rateLimiter.set(recipient, {
      count: 1,
      firstRequest: now
    });
    return false;
  }
  
  // Increment count
  record.count++;
  rateLimiter.set(recipient, record);
  
  // Check if limit exceeded
  return record.count > maxRequests;
};

// Email templates with sanitized inputs
const emailTemplates = {
  signup: (userName, userEmail, userRole) => ({
    subject: 'Welcome to Apothecary Shop!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5530;">Welcome to Apothecary Shop!</h2>
        <p>Hello ${escapeHtml(userName)},</p>
        <p>Thank you for registering with Apothecary Shop. Your account has been successfully created.</p>
        <p><strong>Account Details:</strong></p>
        <ul>
          <li>Name: ${escapeHtml(userName)}</li>
          <li>Email: ${escapeHtml(userEmail)}</li>
          ${userRole ? `<li>Role: ${escapeHtml(userRole)}</li>` : ''}
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
        <p>Hello ${escapeHtml(userName)},</p>
        <p>This is to notify you that your account was successfully accessed.</p>
        <p><strong>Login Details:</strong></p>
        <ul>
          <li>Email: ${escapeHtml(userEmail)}</li>
          <li>Time: ${escapeHtml(loginTime)}</li>
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
          <li>Email: ${escapeHtml(email)}</li>
          <li>Time: ${escapeHtml(attemptTime)}</li>
          <li>IP Address: ${escapeHtml(ipAddress || 'Unknown')}</li>
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
    subject: `Successful Login via ${escapeHtml(provider)} - Apothecary Shop`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5530;">Login Alert</h2>
        <p>Hello ${escapeHtml(userName)},</p>
        <p>This is to notify you that your account was successfully accessed via ${escapeHtml(provider)}.</p>
        <p><strong>Login Details:</strong></p>
        <ul>
          <li>Email: ${escapeHtml(userEmail)}</li>
          <li>Provider: ${escapeHtml(provider)}</li>
          <li>Time: ${escapeHtml(loginTime)}</li>
          <li>Status: Successful</li>
        </ul>
        <p>If this was not you, please contact our support team immediately.</p>
        <br>
        <p>Best regards,<br>Apothecary Shop Team</p>
      </div>
    `
  })
};

// Send email function with validation and rate limiting
const sendEmail = async (to, template, data) => {
  try {
    // Validate recipient email format
    if (!isValidEmail(to)) {
      const error = new Error('Invalid recipient email format');
      error.code = 'INVALID_EMAIL';
      console.error('Email validation failed:', { to, error: error.message });
      return { success: false, error };
    }

    // Check rate limiting
    if (isRateLimited(to)) {
      const error = new Error('Rate limit exceeded for this recipient');
      error.code = 'RATE_LIMIT_EXCEEDED';
      console.error('Rate limit exceeded:', { to, error: error.message });
      return { success: false, error };
    }

    const transporter = getTransporter();
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
    console.error('Error sending email:', { 
      to, 
      template, 
      error: error.message,
      stack: error.stack 
    });
    return { success: false, error };
  }
};

// Specific email functions for different events (updated to pass role)
const sendSignupEmail = async (userName, userEmail, userRole = null) => {
  return await sendEmail(userEmail, 'signup', [userName, userEmail, userRole]);
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

// Initialize transporter at module load to validate env vars early
try {
  getTransporter();
} catch (error) {
  console.error('Email service initialization failed:', error.message);
}

module.exports = {
  sendSignupEmail,
  sendSigninEmail,
  sendInvalidCredentialsEmail,
  sendOAuthSigninEmail,
  sendEmail
};