const express = require('express');
const router = express.Router();
const { googleOauthController, googleCallbackMiddleware, googleCallBackController } = require('../controllers/googleController');


/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Initiate Google OAuth login
 *     description: Redirects user to Google OAuth consent screen to start authentication process
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth consent screen
 *       500:
 *         description: OAuth initialization error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Google OAuth callback
 *     description: Handle Google OAuth callback and complete authentication process
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: State parameter for security
 *     responses:
 *       200:
 *         description: Authentication successful, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       302:
 *         description: Redirect to frontend with authentication result
 *       400:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: OAuth callback processing error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// --- Google OAuth Routes ---

// Route #1: The user clicks this to start the Google login process
router.route('/')
.get(googleOauthController())

// Route #2: The callback route Google redirects to after successful authentication
router.route('/callback')
.get(googleCallbackMiddleware(), googleCallBackController)



module.exports = router;  