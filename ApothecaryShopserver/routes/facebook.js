const express = require('express');
const router = express.Router();
const { 
  facebookOauthController, 
  facebookCallbackMiddleware, 
  facebookCallBackController 
} = require('../controllers/facebookController');

/**
 * @swagger
 * /api/auth/facebook:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Initiate Facebook OAuth login
 *     description: Redirects user to Facebook OAuth consent screen to start authentication process
 *     responses:
 *       302:
 *         description: Redirect to Facebook OAuth consent screen
 *       500:
 *         description: OAuth initialization error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/auth/facebook/callback:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Facebook OAuth callback
 *     description: Handle Facebook OAuth callback and complete authentication process
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Authorization code from Facebook
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

// --- Facebook OAuth Routes ---

// Route #1: The user clicks this to start the Facebook login process
router.route('/')
  .get(facebookOauthController())

// Route #2: The callback route Facebook redirects to after successful authentication  
router.route('/callback')
  .get(facebookCallbackMiddleware(), facebookCallBackController)

module.exports = router;