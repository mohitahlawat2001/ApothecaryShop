const express = require('express');
const router = express.Router();
const { googleOauthController, googleCallbackMiddleware, googleCallBackController } = require('../controllers/googleController');


// --- Google OAuth Routes ---

// Route #1: The user clicks this to start the Google login process
router.route('/')
.get(googleOauthController())

// Route #2: The callback route Google redirects to after successful authentication
router.route('/callback')
.get(googleCallbackMiddleware(), googleCallBackController) 



module.exports = router;  