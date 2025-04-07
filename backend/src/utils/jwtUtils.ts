import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';

export const generateToken = (userId: string) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  const token = jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: '1h', // Token expiration time
  });
  return token;
}
export const verifyToken = (token: string) => {
  try {
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
export const decodeToken = (token: string) => {
  try {
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}
