const express = require('express');
const router = express.Router();
const { 
  facebookOauthController, 
  facebookCallbackMiddleware, 
  facebookCallBackController 
} = require('../controllers/facebookController');

// --- Facebook OAuth Routes ---

// Route #1: The user clicks this to start the Facebook login process
router.route('/')
  .get(facebookOauthController())

// Route #2: The callback route Facebook redirects to after successful authentication  
router.route('/callback')
  .get(facebookCallbackMiddleware(), facebookCallBackController)

module.exports = router;