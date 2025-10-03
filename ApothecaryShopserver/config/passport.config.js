const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();
const User = require('../models/user');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://localhost:5000/api/auth/google/callback', // This must match the URI in Google Console
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists in your DB with the Google ID
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    // User found, log them in
                    return done(null, user);
                } else {
                    // If not, check if they exist by email (in case they signed up locally before)
                    user = await User.findOne({ email: profile.emails[0].value });

                    if (user) {
                        // User exists with email, so link the googleId to their account
                        user.googleId = profile.id;
                        await user.save();
                        return done(null, user);
                    } else {
                        // This is a completely new user
                        const newUser = new User({
                            googleId: profile.id,
                            name: profile.name.givenName + ' ' + profile.name.familyName,
                            email: profile.emails[0].value,
                            // No password is set for OAuth users
                        });
                        await newUser.save();
                        return done(null, newUser);
                    }
                }
            } catch (error) {
                return done(error, false);
            }
        }
    )
);