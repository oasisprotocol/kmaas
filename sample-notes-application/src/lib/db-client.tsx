"use server"

import Database from "better-sqlite3";
let db: Database = null;


// better-sqlite3 functions are synchronous but server actions are required to be async
async function initDatabase() {
  if (!db) {
    db = new Database(':memory:'); // In-memory DB

    db.exec(`
        CREATE TABLE IF NOT EXISTS users(
          username VARCHAR(255) unique,
          public_key TEXT,
          kmaas TEXT
        );
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS notes(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            encrypted_bytes TEXT
        );
    `);
  }
};

export async function runQuery(query: string, params: any[]) {
    try {
        if (!db) {
            await initDatabase();
        }
        const stmt = db.prepare(query);
        return stmt.run(params);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function fetchQuery(query: string, params: any[]) {
    try {
        if (!db) {
            await initDatabase();
        }
        const stmt = db.prepare(query);
        return stmt.all(params);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const closeDatabase = async () => {
  db.close();
};

export async function getPublicKey(username: string) {
    var query = "SELECT public_key FROM users WHERE username = ?";
    var results = await fetchQuery(query, [username]);
    return results[0].public_key;
}

