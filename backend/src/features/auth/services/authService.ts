import { Request, Response } from 'express';
import { User } from '../models/userModel';
import { JWT_SECRET, REFRESH_TOKEN_SECRET } from "../../../config/env";
import { hashPassword, verifyPassword } from '../../../utils/passwordUtils';

/// Update this function in your authService
export const ensureTestUser = async () => {
  if (process.env.NODE_ENV === 'development') {
    try {
      // First, remove any existing test user to ensure clean state
      await User.destroy({ where: { email: 'admin@niewin.local' } });
      
      console.log('Creating test user: admin@niewin.local');
      
      // Use the same password as in the frontend!
      const testPassword = 'TestPas$953#&699';
      const hashedPassword = await hashPassword(testPassword);
      
      // Create the user
      const user = await User.create({
        username: 'Niewin',
        email: 'admin@niewin.local',
        password: hashedPassword
      });
      
      console.log('Test user created successfully:', user.id);
      
      // Verify the password works
      const passwordWorks = await verifyPassword(user.password, testPassword);
      console.log('Password verification:', passwordWorks ? 'SUCCESS' : 'FAILED');
      
      if (!passwordWorks) {
        console.error('⚠️ WARNING: Password verification failed!');
        console.error('This indicates a problem with password hashing/comparing');
      }
    } catch (error) {
      console.error('Error ensuring test user exists:', error);
    }
  }
};