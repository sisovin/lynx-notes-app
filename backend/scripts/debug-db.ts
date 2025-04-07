import { sequelize } from '../src/utils/database';
import { User } from '../src/features/auth/models/userModel';
import { hashPassword } from '../src/utils/passwordUtils';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.resolve(process.cwd(), './database.sqlite');

const debugDatabase = async () => {
  try {
    // Check if database file exists and delete it
    if (fs.existsSync(DB_PATH)) {
      console.log(`Database file exists at: ${DB_PATH}, removing it for clean start...`);
      fs.unlinkSync(DB_PATH);
      console.log('Database file deleted.');
    }
    
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('Connection established successfully.');
    
    // Sync the database to create tables
    console.log('Creating database schema...');
    await sequelize.sync({ force: true });
    console.log('Database schema created successfully.');
    
    // Create test user with properly hashed password
    console.log('Creating test user...');
    const hashedPassword = await hashPassword('TestPas$953#&699');
    
    const user = await User.create({
      username: 'Niewin',
      email: 'admin@niewin.local',
      password: hashedPassword,
      isDeleted: false,
      resetToken: null,
      resetTokenExpires: null
    });
    
    console.log('Test user created:', user.toJSON());
    
    // Verify user is retrievable
    const retrievedUser = await User.findOne({ where: { email: 'admin@niewin.local' } });
    console.log('Retrieved user:', retrievedUser?.toJSON() || 'Not found');
    
    // Test password verification
    if (retrievedUser) {
      const passwordValid = await require('../src/utils/passwordUtils').verifyPassword(
        retrievedUser.password,
        'TestPas$953#&699'
      );
      console.log('Password verification test:', passwordValid ? 'PASSED ✅' : 'FAILED ❌');
    }
    
    console.log('\nDatabase setup complete. Ready for testing.');
    
    // Print curl command for testing login
    console.log('\nTo test login, run:');
    console.log(`curl -X POST http://localhost:3001/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "admin@niewin.local", "password": "TestPas$953#&699"}'`);
    
  } catch (error) {
    console.error('Database debug error:', error);
  } finally {
    console.log('Closing database connection...');
    await sequelize.close();
    console.log('Connection closed.');
  }
};

debugDatabase().catch(console.error);