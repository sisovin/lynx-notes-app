import fs from 'node:fs';
import path from 'node:path';

async function resetDatabase() {
  try {
    const dbPath = path.resolve(process.cwd(), 'database.sqlite');
    
    // Check if database file exists
    if (fs.existsSync(dbPath)) {
      // Backup the database before deleting
      const backupPath = path.resolve(process.cwd(), `database.sqlite.backup.${Date.now()}`);
      fs.copyFileSync(dbPath, backupPath);
      console.log(`Existing database backed up to ${backupPath}`);
      
      // Delete the database file
      fs.unlinkSync(dbPath);
      console.log('Database file deleted successfully');
    } else {
      console.log('No database file found to reset');
    }
    
    console.log('Database has been reset. Run "bun run dev" to recreate the schema.');
  } catch (error) {
    console.error('Error resetting database:', error);
  }
}

resetDatabase();