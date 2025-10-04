const passport = require('passport');
const jwt = require('jsonwebtoken');
require('dotenv').config();

function googleOauthController(){
    return passport.authenticate('google', {
        scope: ['profile', 'email'] // Specify the user info you need from Google
    })
}

function googleCallbackMiddleware(){
    return passport.authenticate('google', {
        failureRedirect: 'http://localhost:5173/login', // Your login page
        session: false // Use JWT, not session-based auth
    })
}

async function googleCallBackController(req,res){
    // At this point, `req.user` is populated by the Passport strategy's `done` function
    const user = req.user;
    const token =  jwt.sign(
        { 
        id: user._id,  // Keep id for backward compatibility
        sub: user._id, // Add sub to match the token format you're receiving
        role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
   
    // Prepare user data for frontend
    const userData = { id: user._id, name: user.name, email: user.email, role: user.role };
    
    // Encode user data for URL
    const encodedUser = encodeURIComponent(JSON.stringify(userData));
    
    // Redirect to frontend with token and user data as URL parameters
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?token=${token}&user=${encodedUser}`);

    // Alternative: For json based approach you can directly send the token and manage the callback url in the frontend app.
    // res.json({ token, user: userData });

    //For Cookie based you can do this and then redirect using this only to the dashboard or whatever url you want
    // res.cookie('token', token, { httpOnly: true, expires: new Date(Date.now() + 24 * 60 * 60 * 1000) });
}

module.exports = { googleOauthController, googleCallbackMiddleware, googleCallBackController };