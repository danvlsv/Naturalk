import * as SQLite from 'expo-sqlite';

const DB_VERSION = 1;
const DB_NAME = 'markers.db';

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    const db = await SQLite.openDatabaseAsync(DB_NAME);

    await db.execAsync('PRAGMA foreign_keys = ON;');

    const result = await db.getFirstAsync<{ user_version: number }>(
      'PRAGMA user_version;'
    );
    const currentVersion = result?.user_version ?? 0;

    if (currentVersion < DB_VERSION) {
      await createTables(db);
      await db.execAsync(`PRAGMA user_version = ${DB_VERSION};`);
    }

    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw new Error(`Failed to initialize database: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const createTables = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS markers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        title TEXT NOT NULL, -- Add title column
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS marker_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        marker_id INTEGER NOT NULL,
        uri TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (marker_id) REFERENCES markers (id) ON DELETE CASCADE
      );
    `);

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw new Error(`Failed to create tables: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const closeDatabase = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  try {
    await db.closeAsync();
  } catch (error) {
    console.error('Error closing database:', error);
  }
};