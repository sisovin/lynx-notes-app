import argon2 from 'argon2';

export const hashPassword = async (password: string): Promise<string> => {
  try {
    const hashedPassword = await argon2.hash(password);
    return hashedPassword;
  } catch (error) {
    throw new Error('Error hashing password');
  }
};

export const verifyPassword = async (hashedPassword: string, password: string): Promise<boolean> => {
  try {
    const isPasswordValid = await argon2.verify(hashedPassword, password);
    return isPasswordValid;
  } catch (error) {
    throw new Error('Error verifying password');
  }
};
