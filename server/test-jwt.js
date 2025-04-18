// Test JWT Secret
import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

// Check JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET;
console.log('JWT_SECRET exists:', !!JWT_SECRET);
console.log('JWT_SECRET length:', JWT_SECRET ? JWT_SECRET.length : 0);

// Create a test token
function createTestToken() {
  try {
    if (!JWT_SECRET) {
      console.error('❌ JWT_SECRET is missing in environment variables');
      return null;
    }
    
    const payload = {
      id: 'test123',
      email: 'test@example.com'
    };
    
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    console.log('✅ Test token created successfully');
    return token;
  } catch (error) {
    console.error('❌ Error creating test token:', error.message);
    return null;
  }
}

// Verify a token
function verifyTestToken(token) {
  try {
    if (!token) {
      console.error('❌ No token to verify');
      return false;
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token verified successfully:', decoded);
    return true;
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    return false;
  }
}

// Run tests
const testToken = createTestToken();
if (testToken) {
  verifyTestToken(testToken);
  
  // Try verifying with a modified token to ensure JWT_SECRET is actually being used
  const modifiedToken = testToken + 'a';
  console.log('\nTesting with modified token (should fail):');
  verifyTestToken(modifiedToken);
} 