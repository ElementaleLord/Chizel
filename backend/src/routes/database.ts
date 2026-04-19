import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DB_KEY,
  ssl: {
    rejectUnauthorized: false,
  },
});

// getUserPasswordEmail(email), for login by email
export async function getUserPasswordEmail(params: string[]) {
    const string = "SELECT a_password FROM accounts WHERE a_email = $1;";
    const res = await pool.query(string, params);
    return res.rows;
}

// getUserPasswordName(name), for login by username
export async function getUserPasswordName(params: string[]) {
    const string = "SELECT a_password FROM accounts WHERE a_username = $1;";
    const res = await pool.query(string, params);
    return res.rows;
}

// getRepoId(url), using id is better than urls as its naturally faster for searching
// so, get an id via url for simplicity then use said id to get other stuff
export async function getRepoId(params: string[]){
    const string = "SELECT r_id FROM repositories WHERE r_url = $1;";
    const res = await pool.query(string, params);
    return res.rows;
}

// getRepoData(id), for repo file explorer view
export async function getRepoData(params: BigInt[]) {
    const string = "SELECT * FROM repositories WHERE r_url = $1;";
    const res = await pool.query(string, params);
    return res.rows;
}

// getRepoPullRequests(id), for repo's pull requests
export async function getRepoPullRequests(params: BigInt[]) {
    const string = "SELECT * FROM pull_requests WHERE repo_id = $1;";
    const res = await pool.query(string, params);
    return res.rows;
}

// getUserRepos(name), fetches all repos owned/contributed by user
export async function getUserRepos(params: string[]) {
    const string = `WITH user_id AS (
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
    const res = await pool.query(string, params);
    return res.rows;
}