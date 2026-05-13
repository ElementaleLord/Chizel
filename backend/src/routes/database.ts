import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DB_KEY,
  ssl: {
    rejectUnauthorized: false,
  },
});

export interface DBUser {
  email: string;
  username: string;
  passwordHash: string;
}

// createUser(DBUser) adds a new entry to the database
export async function createUser(user: DBUser) {
    try {
        const query = `
            INSERT INTO accounts (a_username, a_email, a_password)
            VALUES ($1, $2, $3)
            RETURNING a_id, a_email;
        `;

        const res = await pool.query(query, [user.username, user.email, user.passwordHash]);
        return res.rows[0]?.a_id ?? null;
    } catch (err) {
        console.error("DB insert error:", err);
        return null;
    }
}

// checkUserExistence(email), for making sure a user exists with the specified email
export async function checkUserExistence(email: string): Promise<boolean> {
    try {
        const query = `
            SELECT EXISTS (
                SELECT 1 FROM accounts WHERE a_email = $1
            ) AS exists;
        `;

        const res = await pool.query<{ exists: boolean }>(query, [email]);
        return res.rows[0].exists;
    } catch (err) {
        console.error(err);
        return false;
    }
}

// getUserInfo(email), to get information of a user by email
export async function getUserInfo(email: string){
    try {
        const cmd = "SELECT * FROM accounts WHERE a_email = $1;";
        const res = await pool.query(cmd, [email]);
        return res.rows[0];
    } catch (err) {
        console.error(err);
        return null;
    }
}

// getUserPasswordEmail(email), for login by email
export async function getUserPasswordEmail(email: string): Promise<string | null> {
    try {
        const cmd = "SELECT a_password FROM accounts WHERE a_email = $1;";
        const res = await pool.query(cmd, [email]);
        return res.rows[0]?.a_password ?? null;
    } catch (err) {
        console.error(err);
        return null;
    }
}

// getUserPasswordName(name), for login by username
export async function getUserPasswordName(name: string): Promise<string | null> {
    try{
        const cmd = "SELECT a_password FROM accounts WHERE a_username = $1;";
        const res = await pool.query(cmd, [name]);
        return res.rows[0]?.a_password ?? null;
    } catch(err){
        console.error(err);
        return null;
    }
}

// getRepoId(url), using id is better than urls as its naturally faster for searching
// so, get an id via url for simplicity then use said id to get other stuff
export async function getRepoId(url: string){
    try{
        const cmd = "SELECT r_id FROM repositories WHERE r_url = $1;";
        const res = await pool.query(cmd, [url]);
        return res.rows[0]?.r_id ?? null;
    }catch(err){
        console.error(err);
        return null;
    }
}

// getRepoData(id), for repo file explorer view
export async function getRepoData(id: BigInt) {
    try{
        const cmd = "SELECT * FROM repositories WHERE r_id = $1;";
        const res = await pool.query(cmd, [id]);
        return res.rows[0];
    }catch(err){
        console.error(err);
        return null;
    }
}

// getRepoPullRequests(id), for repo's pull requests
export async function getRepoPullRequests(id: BigInt) {
    try{
        const cmd = "SELECT * FROM pull_requests WHERE repo_id = $1;";
        const res = await pool.query(cmd, [id]);
        return res.rows[0];
    }catch(err){
        console.error(err);
        return null;
    }
}

// getUserRepos(name), fetches all repos owned/contributed by user
export async function getUserRepos(name: string) {
    try{
        const cmd = `WITH user_id AS (
                            SELECT a_id
                            FROM accounts
                            WHERE a_username = $1
                        )

                        SELECT r.*
                        FROM repositories r, user_id u
                        WHERE r.r_owner = u.a_id

                        UNION

                        SELECT r.*
                        FROM repositories r
                        JOIN repository_contributors rc
                        ON rc.repo_id = r.r_id
                        JOIN user_id u
                        ON rc.user_id = u.a_id;`; 
        const res = await pool.query(cmd, [name]);
        return res.rows;
    }catch(err){
        console.error(err);
        return null;
    }
}

export default pool;