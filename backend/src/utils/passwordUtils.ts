import bcrypt from "bcryptjs";

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const verifyPassword = async (
  hashedPassword: string | null | undefined,
  plainPassword: string | null | undefined
): Promise<boolean> => {
  // Add defensive checks to prevent bcryptjs errors
  if (!hashedPassword || !plainPassword) {
    return false;
  }
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
};