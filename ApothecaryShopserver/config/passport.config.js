const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
require('dotenv').config();
const User = require('../models/user');

// Google Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    return done(null, user);
                } else {
                    user = await User.findOne({ email: profile.emails[0].value });

                    if (user) {
                        user.googleId = profile.id;
                        user.avatar = profile.photos && profile.photos[0].value;
                        user.provider = 'google';
                        await user.save();
                        return done(null, user);
                    } else {
                        const newUser = new User({
                            googleId: profile.id,
                            name: profile.displayName,
                            email: profile.emails[0].value,
                            avatar: profile.photos && profile.photos[0].value,
                            provider: 'google',
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

// Facebook Strategy
passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: process.env.FACEBOOK_CALLBACK_URL,
            profileFields: ['id', 'displayName', 'photos', 'email']
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ facebookId: profile.id });

                if (user) {
                    return done(null, user);
                } else {
                    user = await User.findOne({ 
                        email: profile.emails ? profile.emails[0].value : null 
                    });

                    if (user) {
                        user.facebookId = profile.id;
                        user.avatar = profile.photos ? profile.photos[0].value : user.avatar;
                        user.provider = 'facebook';
                        await user.save();
                        return done(null, user);
                    } else {
                        const newUser = new User({
                            facebookId: profile.id,
                            name: profile.displayName,
                            email: profile.emails ? profile.emails[0].value : `${profile.id}@facebook.com`,
                            avatar: profile.photos ? profile.photos[0].value : null,
                            provider: 'facebook',
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

// Serialize/Deserialize
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});