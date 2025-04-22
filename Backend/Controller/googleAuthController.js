import { OAuth2Client } from 'google-auth-library';
import User from '../Models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Initialize OAuth client with your Google Client ID
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Error handler utility
const handleError = (res, error, statusCode = 500) => {
  console.error('Google Auth Error:', error.message);
  res.status(statusCode).json({ 
    success: false, 
    message: error.message || 'Server Error' 
  });
};

const GoogleAuthController = {
  // Google login/signup
  googleLogin: async (req, res) => {
    try {
      const { credential } = req.body;
      
      if (!credential) {
        return res.status(400).json({
          success: false,
          message: 'Google credential is required'
        });
      }

      // Verify the Google token
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      // Get user data from the token
      const payload = ticket.getPayload();
      const { sub, email, name, picture } = payload;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email not provided by Google'
        });
      }

      console.log('Google auth payload:', { sub, email, name });

      // Check if user already exists
      let user = await User.findOne({ email });
      
      if (!user) {
        // Generate a random password for Google users
        const randomPassword = crypto.randomBytes(16).toString('hex');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(randomPassword, salt);
        
        // Generate a unique phone identifier for Google users
        const phoneNumber = `google_${Date.now()}`;
        
        // Create new user
        user = new User({
          name,
          email,
          password: hashedPassword,
          phone: phoneNumber,
          googleId: sub,
          profilePicture: picture
        });

        await user.save();
        console.log('New Google user created:', user._id);
      } else if (!user.googleId) {
        // If user exists but doesn't have a googleId, update it
        user.googleId = sub;
        if (picture && !user.profilePicture) {
          user.profilePicture = picture;
        }
        await user.save();
        console.log('Existing user updated with Google ID:', user._id);
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Return user data without password
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture || picture
      };

      res.status(200).json({
        success: true,
        message: 'Google authentication successful',
        token,
        data: userData
      });
    } catch (error) {
      console.error('Google auth error:', error);
      handleError(res, error);
    }
  }
};

export default GoogleAuthController;
