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

export async function getRepoByOwnerAndName(owner: string, repo: string) {
    try{
        const basePath = `${owner}/${repo}`;
        const cmd = `
            SELECT *
            FROM repositories
            WHERE r_url = $1
               OR r_url = $2
               OR r_url = $3
               OR r_url = $4
            LIMIT 1;
        `;
        const candidates = [
            `chizel.com/${basePath}`,
            `https://chizel.com/${basePath}`,
            `http://chizel.com/${basePath}`,
            basePath,
        ];
        const res = await pool.query(cmd, candidates);
        return res.rows[0] ?? null;
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

export interface RepoInteractionSummary {
    stars: number;
    watchers: number;
    forks: number;
    viewerHasStarred: boolean;
    viewerIsWatching: boolean;
}

let repoInteractionSchemaPromise: Promise<void> | null = null;

function coerceMetricSeed(value: unknown): number {
    if (typeof value === "number" && Number.isFinite(value)) {
        return Math.max(0, Math.trunc(value));
    }

    if (typeof value === "string") {
        const parsed = Number.parseInt(value, 10);
        if (Number.isFinite(parsed)) {
            return Math.max(0, parsed);
        }
    }

    return 0;
}

function getRepoMetricSeed(repoData: Record<string, unknown> | null | undefined, keys: string[]) {
    if (!repoData) {
        return 0;
    }

    for (const key of keys) {
        if (key in repoData) {
            return coerceMetricSeed(repoData[key]);
        }
    }

    return 0;
}

async function ensureRepoInteractionSchema() {
    try{
        if (!repoInteractionSchemaPromise) {
            const cmd = `
                CREATE TABLE IF NOT EXISTS repository_metrics (
                    repo_id BIGINT PRIMARY KEY REFERENCES repositories(r_id) ON DELETE CASCADE,
                    stars_count INTEGER NOT NULL DEFAULT 0,
                    watchers_count INTEGER NOT NULL DEFAULT 0,
                    forks_count INTEGER NOT NULL DEFAULT 0,
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );

                CREATE TABLE IF NOT EXISTS repository_stars (
                    repo_id BIGINT NOT NULL REFERENCES repositories(r_id) ON DELETE CASCADE,
                    user_id BIGINT NOT NULL REFERENCES accounts(a_id) ON DELETE CASCADE,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    PRIMARY KEY (repo_id, user_id)
                );

                CREATE TABLE IF NOT EXISTS repository_watchers (
                    repo_id BIGINT NOT NULL REFERENCES repositories(r_id) ON DELETE CASCADE,
                    user_id BIGINT NOT NULL REFERENCES accounts(a_id) ON DELETE CASCADE,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    PRIMARY KEY (repo_id, user_id)
                );
            `;

            repoInteractionSchemaPromise = pool.query(cmd).then(() => undefined);
        }

        return await repoInteractionSchemaPromise;
    }catch(err){
        repoInteractionSchemaPromise = null;
        console.error(err);
        return null;
    }
}

async function ensureRepoMetricsRow(repoId: bigint | number | string, repoData?: Record<string, unknown> | null) {
    try{
        await ensureRepoInteractionSchema();

        const starsSeed = getRepoMetricSeed(repoData, ["r_stars", "r_star_count", "stars", "stars_count"]);
        const watchersSeed = getRepoMetricSeed(repoData, ["r_watchers", "r_watch_count", "watchers", "watchers_count"]);
        const forksSeed = getRepoMetricSeed(repoData, ["r_forks", "r_fork_count", "forks", "forks_count"]);
        const cmd = `
            INSERT INTO repository_metrics (repo_id, stars_count, watchers_count, forks_count)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (repo_id) DO UPDATE SET
                stars_count = GREATEST(repository_metrics.stars_count, EXCLUDED.stars_count),
                watchers_count = GREATEST(repository_metrics.watchers_count, EXCLUDED.watchers_count),
                forks_count = GREATEST(repository_metrics.forks_count, EXCLUDED.forks_count),
                updated_at = NOW();
        `;

        await pool.query(cmd, [repoId, starsSeed, watchersSeed, forksSeed]);
        return true;
    }catch(err){
        console.error(err);
        return false;
    }
}

export async function getRepoInteractionSummary(
    repoId: bigint | number | string,
    userId?: number,
    repoData?: Record<string, unknown> | null
): Promise<RepoInteractionSummary> {
    try{
        await ensureRepoMetricsRow(repoId, repoData);
        const metricsCmd = `
            SELECT stars_count, watchers_count, forks_count
            FROM repository_metrics
            WHERE repo_id = $1;
        `;
        const viewerCmd = `
            SELECT
                EXISTS (
                    SELECT 1
                    FROM repository_stars
                    WHERE repo_id = $1 AND user_id = $2
                ) AS starred,
                EXISTS (
                    SELECT 1
                    FROM repository_watchers
                    WHERE repo_id = $1 AND user_id = $2
                ) AS watching;
        `;
        const metricsPromise = pool.query(metricsCmd, [repoId]);
        const viewerPromise = userId
            ? pool.query(viewerCmd, [repoId, userId])
            : Promise.resolve({ rows: [{ starred: false, watching: false }] });
        const [metricsResult, viewerResult] = await Promise.all([metricsPromise, viewerPromise]);
        const metrics = metricsResult.rows[0];
        const viewer = viewerResult.rows[0];

        return {
            stars: coerceMetricSeed(metrics?.stars_count),
            watchers: coerceMetricSeed(metrics?.watchers_count),
            forks: coerceMetricSeed(metrics?.forks_count),
            viewerHasStarred: Boolean(viewer?.starred),
            viewerIsWatching: Boolean(viewer?.watching),
        };
    } catch (err) {
        console.error(err);
        return {
            stars: 0,
            watchers: 0,
            forks: 0,
            viewerHasStarred: false,
            viewerIsWatching: false,
        };
    }
}

export async function toggleRepoStar(
    repoId: bigint | number | string,
    userId: number,
    repoData?: Record<string, unknown> | null
): Promise<RepoInteractionSummary> {
    try{
        await ensureRepoMetricsRow(repoId, repoData);

        const client = await pool.connect();

        try{
            const beginCmd = "BEGIN";
            const insertCmd = `
                INSERT INTO repository_stars (repo_id, user_id)
                VALUES ($1, $2)
                ON CONFLICT DO NOTHING
                RETURNING repo_id;
            `;
            const incrementCmd = `
                UPDATE repository_metrics
                SET stars_count = stars_count + 1,
                    updated_at = NOW()
                WHERE repo_id = $1;
            `;
            const deleteCmd = `
                DELETE FROM repository_stars
                WHERE repo_id = $1 AND user_id = $2;
            `;
            const decrementCmd = `
                UPDATE repository_metrics
                SET stars_count = GREATEST(stars_count - 1, 0),
                    updated_at = NOW()
                WHERE repo_id = $1;
            `;
            const commitCmd = "COMMIT";
            const rollbackCmd = "ROLLBACK";

            await client.query(beginCmd);

            const insertResult = await client.query(insertCmd, [repoId, userId]);

            if ((insertResult.rowCount ?? 0) > 0) {
                await client.query(incrementCmd, [repoId]);
            } else {
                const deleteResult = await client.query(deleteCmd, [repoId, userId]);

                if ((deleteResult.rowCount ?? 0) > 0) {
                    await client.query(decrementCmd, [repoId]);
                }
            }

            await client.query(commitCmd);
        }catch(err){
            await client.query(rollbackCmd);
            throw err;
        }finally{
            client.release();
        }

        return await getRepoInteractionSummary(repoId, userId, repoData);
    }catch(err){
        console.error(err);
        return {
            stars: 0,
            watchers: 0,
            forks: 0,
            viewerHasStarred: false,
            viewerIsWatching: false,
        };
    }
}

export async function toggleRepoWatch(
    repoId: bigint | number | string,
    userId: number,
    repoData?: Record<string, unknown> | null
): Promise<RepoInteractionSummary> {
    try{
        await ensureRepoMetricsRow(repoId, repoData);

        const client = await pool.connect();

        try{
            const beginCmd = "BEGIN";
            const insertCmd = `
                INSERT INTO repository_watchers (repo_id, user_id)
                VALUES ($1, $2)
                ON CONFLICT DO NOTHING
                RETURNING repo_id;
            `;
            const incrementCmd = `
                UPDATE repository_metrics
                SET watchers_count = watchers_count + 1,
                    updated_at = NOW()
                WHERE repo_id = $1;
            `;
            const deleteCmd = `
                DELETE FROM repository_watchers
                WHERE repo_id = $1 AND user_id = $2;
            `;
            const decrementCmd = `
                UPDATE repository_metrics
                SET watchers_count = GREATEST(watchers_count - 1, 0),
                    updated_at = NOW()
                WHERE repo_id = $1;
            `;
            const commitCmd = "COMMIT";
            const rollbackCmd = "ROLLBACK";

            await client.query(beginCmd);

            const insertResult = await client.query(insertCmd, [repoId, userId]);

            if ((insertResult.rowCount ?? 0) > 0) {
                await client.query(incrementCmd, [repoId]);
            } else {
                const deleteResult = await client.query(deleteCmd, [repoId, userId]);

                if ((deleteResult.rowCount ?? 0) > 0) {
                    await client.query(decrementCmd, [repoId]);
                }
            }

            await client.query(commitCmd);
        }catch(err){
            await client.query(rollbackCmd);
            throw err;
        }finally{
            client.release();
        }

        return await getRepoInteractionSummary(repoId, userId, repoData);
    }catch(err){
        console.error(err);
        return {
            stars: 0,
            watchers: 0,
            forks: 0,
            viewerHasStarred: false,
            viewerIsWatching: false,
        };
    }
}

export default pool;
