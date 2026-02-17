import * as SQLite from 'expo-sqlite';
import { DB_NAME, SCHEMA } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
    if (db) return db;

    try {
        db = await SQLite.openDatabaseAsync(DB_NAME);

        // Enable foreign keys
        await db.execAsync('PRAGMA foreign_keys = ON;');

        // Create tables
        await db.execAsync(SCHEMA.patients);
        await db.execAsync(SCHEMA.visits);
        await db.execAsync(SCHEMA.medical_history);
        await db.execAsync(SCHEMA.prescriptions);
        await db.execAsync(SCHEMA.lab_results);

        console.log('Database initialized successfully');
        return db;
    } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
    }
};

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
    if (!db) {
        return await initDatabase();
    }
    return db;
};

// Helper for resetting DB (dev only)
export const resetDatabase = async () => {
    if (!db) db = await initDatabase();
    await db.execAsync('DROP TABLE IF EXISTS lab_results;');
    await db.execAsync('DROP TABLE IF EXISTS prescriptions;');
    await db.execAsync('DROP TABLE IF EXISTS medical_history;');
    await db.execAsync('DROP TABLE IF EXISTS visits;');
    await db.execAsync('DROP TABLE IF EXISTS patients;');
    await initDatabase();
};
