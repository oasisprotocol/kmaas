"use server"

import pg from 'pg';

const {Pool} = pg;

let cached = global.pool;
if (!cached) {
    cached = {};
    global.pool = cached;
}

export async function runQuery(query: string, params: any[]) {
    // Uses localhost:5432 by default for database
    if (!cached.pool) {
        const pool = new Pool({
          user: process.env.PG_USER,
          database: process.env.DATABASE_NAME,
          host: 'localhost',
          port: '5432',
          max: 20,
        });
        cached.pool = pool
    }

    try {
        var rows = await cached.pool.query(query, params)
        return rows
    } catch(error) {
        throw error;
    }
}

export async function getPublicKey(username: string) {
    var query = "SELECT public_key FROM users WHERE username = $1"
    var results = await runQuery(query, [username]);
    return results.rows[0].public_key;
}

