import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DB_KEY,
  ssl: {
    rejectUnauthorized: false,
  },
});

// getUserPasswordEmail(email), for login by email
export async function getUserPasswordEmail(params?: any[]) {
    const string = "SELECT a_password FROM accounts WHERE a_email = $1";
    const res = await pool.query(string, params);
    return res.rows;
}

// getUserPasswordName(name), for login by username
export async function getUserPasswordName(params?: any[]) {
    const string = "SELECT a_password FROM accounts WHERE a_username = $1";
    const res = await pool.query(string, params);
    return res.rows;
}

// getUserRepos(name), fetches all repos owned/contributed by user NOT FINISHED
export async function getUserRepos(params?: any[]) {
    const string = "SELECT * FROM repositories WHERE r_owner = $1"; 
    const res = await pool.query(string, params);
    return res.rows;
}

// getRepoData(url), for repo file explorer view
export async function getRepoData(params?: any[]) {
    const string = "SELECT * FROM repositories WHERE r_url = $1";
    const res = await pool.query(string, params);
    return res.rows;
}

// getRepoPullRequests(url), for repo's pull requests
export async function getRepoPullRequests(params?: any[]) {
    const string = "SELECT * FROM pull_requests WHERE repo_url = $1";
    const res = await pool.query(string, params);
    return res.rows;
}