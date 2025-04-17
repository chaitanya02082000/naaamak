import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Route to check environment variables and configuration
router.get('/config', (req, res) => {
  res.json({
    // Only show first few characters of sensitive values for security
    googleClientId: process.env.GOOGLE_CLIENT_ID 
      ? `${process.env.GOOGLE_CLIENT_ID.substring(0, 5)}...` 
      : 'NOT SET',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET 
      ? 'SET (hidden)' 
      : 'NOT SET',
    googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || 'NOT SET',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || '5000'
  });
});

// Test route that mimics Google callback
router.get('/mock-oauth-callback', (req, res) => {
  // Create a mock user and token
  const mockUserId = 'mock-user-123';
  const mockToken = 'mock-token-abc';
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  
  res.redirect(`${clientUrl}/oauth-callback?token=${mockToken}&userId=${mockUserId}`);
});

export default router; 