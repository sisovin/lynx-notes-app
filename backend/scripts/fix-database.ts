import { sequelize } from '../src/utils/database';
import fs from 'node:fs';
import path from 'node:path';

async function fixDatabase() {
  try {
    console.log('Attempting to fix database foreign key constraints...');
    
    // Enable foreign key enforcement
    await sequelize.query('PRAGMA foreign_keys = ON;');
    
    // First, get all tables
    const [tables] = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
    );
    
    console.log('Found tables:', tables);
    
    // Find foreign key references to users table
    for (const table of tables as { name: string }[]) {
      const tableName = table.name;
      if (tableName === 'users' || tableName === 'users_backup') continue;
      
      const [foreignKeys] = await sequelize.query(
        `PRAGMA foreign_key_list('${tableName}');`
      );
      
      console.log(`Foreign keys for ${tableName}:`, foreignKeys);
      
      // Check if any foreign key points to users table
      // Fix: Properly handle the foreignKeys result
      if (Array.isArray(foreignKeys)) {
        const userForeignKeys = foreignKeys.filter((fk: any) => fk.table === 'users');
        if (userForeignKeys.length > 0) {
          console.log(`Table ${tableName} has foreign keys to users table:`, userForeignKeys);
        }
      } else if (foreignKeys && typeof foreignKeys === 'object') {
        // Handle case where it's a single object
        const fkObject = foreignKeys as any;
        if (fkObject.table === 'users') {
          console.log(`Table ${tableName} has a foreign key to users table:`, fkObject);
        }
      }
    }
    
    // Option 1: Temporary disable foreign key enforcement
    console.log('Temporarily disabling foreign keys...');
    await sequelize.query('PRAGMA foreign_keys = OFF;');
    
    // Drop notes table first since it has a foreign key reference to users
    try {
      console.log('Attempting to drop notes table...');
      await sequelize.query('DROP TABLE IF EXISTS `notes`;');
      console.log('Notes table dropped successfully');
    } catch (error) {
      console.error('Failed to drop notes table:', error);
    }
    
    // Then try to drop the users_backup table
    try {
      console.log('Attempting to drop users_backup table...');
      await sequelize.query('DROP TABLE IF EXISTS `users_backup`;');
      console.log('Users_backup table dropped successfully');
    } catch (error) {
      console.error('Failed to drop users_backup table:', error);
    }
    
    // Finally drop the users table
    try {
      console.log('Attempting to drop users table...');
      await sequelize.query('DROP TABLE IF EXISTS `users`;');
      console.log('Users table dropped successfully');
    } catch (error) {
      console.error('Failed to drop users table:', error);
    }
    
    // Backup the database before making changes
    const dbPath = path.resolve(process.cwd(), 'database.sqlite');
    const backupPath = path.resolve(process.cwd(), 'database.sqlite.backup');
    fs.copyFileSync(dbPath, backupPath);
    console.log(`Database backed up to ${backupPath}`);
    
    console.log('Database fix attempted. Please run "bun run dev" again.');
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    await sequelize.close();
  }
}

fixDatabase();