import { Request, Response } from 'express';
import { User } from '../models/userModel';
import { JWT_SECRET, REFRESH_TOKEN_SECRET } from "../../../config/env";
import { hashPassword, verifyPassword } from '../../../utils/passwordUtils';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize'; // Add this import
// Import Node's crypto or use Bun's crypto API
import * as nodeCrypto from 'crypto';


export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });
    
    // Generate JWT token
    const token = jwt.sign({ id: user.id }, JWT_SECRET!, { expiresIn: '1h' });
    
    return res.status(201).json({ 
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Add this to your login function for better debugging
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Add detailed logging for troubleshooting
    console.log('Login attempt:', { email, passwordLength: password?.length || 0 });
    
    // Find user
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log(`Login failed: User not found - ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log(`User found: ${user.email} (ID: ${user.id})`);
    console.log(`Stored password hash: ${user.password ? user.password.substring(0, 10) + '...' : 'none'}`);
    
    // Verify password
    let passwordMatch = false;
    
        // Update the special case in your login function
    // Special case for development test user
    if (process.env.NODE_ENV === 'development' && email === 'admin@niewin.local') {
      // Check both the expected passwords for development mode
      if (password === 'password' || password === 'TestPas$953#&699') {
        console.log('Development test user detected, bypassing password check');
        passwordMatch = true;
      } else {
        console.log(`Development test user password mismatch: Expected 'TestPas$953#&699', got '${password?.substring(0, 3)}...'`);
      }
    } else {
      try {
        passwordMatch = await verifyPassword(user.password, password);
        console.log(`Regular password verification result: ${passwordMatch}`);
      } catch (verifyError) {
        console.error('Error during password verification:', verifyError);
        return res.status(500).json({ message: 'Error verifying credentials' });
      }
    }
    
    if (!passwordMatch) {
      console.log('Login failed: Password mismatch');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id },
      JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    console.log('Login successful for:', user.email);
    
    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Add to your authController.ts
export const logout = async (req: Request, res: Response) => {
  // In a more complex setup, you would add the token to a blacklist
  // For now, just return success - the frontend will clear the token
  res.status(200).json({ message: 'Logged out successfully' });
};

// Add to your authController.ts
export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token is required' });
  }
  
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET!);
    const userId = (decoded as any).id;
    
    // Generate new access token
    const newAccessToken = jwt.sign({ id: userId }, JWT_SECRET!, { expiresIn: '1h' });
    
    return res.status(200).json({ token: newAccessToken });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
};

// Add to your authController.ts
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'email', 'createdAt']
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Rest of your controller code...

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Still return success to prevent email enumeration
      return res.status(200).json({ message: 'If your email exists in our system, you will receive a password reset link' });
    }
    
    // Generate a reset token using Node's crypto
    const resetToken = nodeCrypto.randomBytes(32).toString('hex');
    const hashedToken = await hashPassword(resetToken);
    
    // Store the token in the user record
    await user.update({
      resetToken: hashedToken,
      resetTokenExpires: new Date(Date.now() + 3600000) // 1 hour
    });
    
    // In a real app, send an email with the reset link
    // For now, just return the token for testing
    return res.status(200).json({
      message: 'If your email exists in our system, you will receive a password reset link',
      token: resetToken // Only include this in development!
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }
    
    // Find user with a valid token (not expired)
    const user = await User.findOne({
      where: {
        resetToken: { [Op.ne]: null },
        resetTokenExpires: {
          [Op.gt]: new Date() // Token hasn't expired
        }
      }
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    // Verify the token
    if (!user.resetToken) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    const isTokenValid = await verifyPassword(user.resetToken, token);
    if (!isTokenValid) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    // Update password and clear reset token
    await user.update({
      password: await hashPassword(password),
      resetToken: null,
      resetTokenExpires: null
    });
    
    return res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Add this development-only endpoint to your authController
export const devResetPassword = async (req: Request, res: Response) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ message: 'Not found' });
  }
  
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Default to 'password' if not provided
    const newPassword = password || 'TestPas$953#&699';
    
    // Find user
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Hash and update password
    const hashedPassword = await hashPassword(newPassword);
    await user.update({ password: hashedPassword });
    
    console.log(`Password reset for ${email} to '${newPassword}'`);
    
    // Verify the new password works
    const passwordCheck = await verifyPassword(hashedPassword, newPassword);
    console.log(`Verification check: ${passwordCheck ? 'PASS' : 'FAIL'}`);
    
    return res.status(200).json({ 
      message: 'Password reset successful',
      email: user.email,
      verificationPassed: passwordCheck
    });
  } catch (error) {
    console.error('Dev password reset error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

