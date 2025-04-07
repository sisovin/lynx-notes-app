/**
 * Password utility functions using Bun's built-in cryptographic functions
 * instead of argon2 (which has Node.js native module compatibility issues)
 */

/**
 * Hash a password using Bun's built-in crypto functions
 * @param password The password to hash
 * @returns A string containing the salt and hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    // Generate a random salt
    const salt = crypto.getRandomValues(new Uint8Array(16));
    
    // Hash the password using the salt
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(password + Buffer.from(salt).toString('hex'))
    );
    
    // Convert the hash to a hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Return the salt and hash together (salt:hash)
    return `${Buffer.from(salt).toString('hex')}:${hashHex}`;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Error hashing password');
  }
};

/**
 * Verify a password against a hash
 * @param hashedPassword The stored password hash (salt:hash)
 * @param password The password to verify
 * @returns boolean indicating whether the password is valid
 */
export const verifyPassword = async (hashedPassword: string, password: string): Promise<boolean> => {
  try {
    // Split the stored hash into salt and hash
    const [salt, storedHash] = hashedPassword.split(':');
    
    // Hash the provided password with the same salt
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(password + salt)
    );
    
    // Convert the hash to a hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Compare the computed hash with the stored hash
    return storedHash === hashHex;
  } catch (error) {
    console.error('Error verifying password:', error);
    throw new Error('Error verifying password');
  }
};