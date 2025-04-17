import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

// Log OAuth configuration on startup
console.log('OAuth Configuration:');
console.log(`Client ID: ${process.env.GOOGLE_CLIENT_ID ? 'Set (hidden)' : 'NOT SET'}`);
console.log(`Client Secret: ${process.env.GOOGLE_CLIENT_SECRET ? 'Set (hidden)' : 'NOT SET'}`);
console.log(`Callback URL: ${process.env.GOOGLE_CALLBACK_URL || 'NOT SET'}`);

// Serialize user for session
passport.serializeUser((user, done) => {
  console.log('Serializing user:', user.id);
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    console.log('Deserializing user:', id);
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    console.error('Error deserializing user:', err);
    done(err, null);
  }
});

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google authentication callback received');
        console.log('Profile ID:', profile.id);
        console.log('Email:', profile.emails[0].value);
        
        // Check if the user already exists in our database
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
          console.log('Existing user found with Google ID');
          // User exists, return user
          return done(null, user);
        }
        
        // Check if user exists with same email
        user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
          console.log('Existing user found with matching email');
          // Update existing user with Google ID
          user.googleId = profile.id;
          if (!user.picture && profile.photos && profile.photos.length > 0) {
            user.picture = profile.photos[0].value;
          }
          await user.save();
          return done(null, user);
        }
        
        console.log('Creating new user from Google profile');
        // Create a new user
        const newUser = new User({
          googleId: profile.id,
          firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User',
          lastName: profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '',
          email: profile.emails[0].value,
          picture: profile.photos?.[0]?.value || '',
        });
        
        await newUser.save();
        done(null, newUser);
      } catch (err) {
        console.error('Error in Google authentication:', err);
        done(err, null);
      }
    }
  )
);

export default passport; 