import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
    connectionString: process.env.DB_KEY,
    ssl: {
        rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 5000
});

pool.on('error', (err) => {
    console.error("Unexpected client error");
});

export interface DBUser {
    email: string;
    username: string;
    passwordHash: string;
}

export interface UserProfileSummary {
    id: string;
    email: string;
    username: string;
    displayname: string | null;
    bio: string | null;
    avatarUrl: string | null;
    joined: string | null;
    followers: number;
    following: number;
    stats: {
        repositories: number;
        contributions: number;
        stars: number;
        totalContributions: number;
        longestStreak: number;
        currentStreak: number;
    };
}

export interface UserProfileRepoSummary {
    id: string;
    name: string;
    description: string | null;
    language: string;
    stars: number;
    forks: number;
    updatedAt: string | null;
    owner: string;
}

export type PullRequestStatus = "Accepted" | "Rejected" | "Merged" | "Null";

export interface RepoPullRequestRecord {
    pr_id: string;
    acc_id: string;
    repo_id: string;
    pr_name: string;
    pr_msg: string | null;
    pr_submit_date: string | null;
    pr_resolve_date: string | null;
    pr_creation_date: string | null;
    pr_isopen: boolean;
    pr_status: PullRequestStatus;
    author_username: string;
}

export interface RepoIssueRecord {
    i_id: string;
    acc_id: string;
    repo_id: string;
    i_name: string;
    i_msg: string | null;
    i_creationdate: string | null;
    i_resolvedate: string | null;
    i_open: boolean;
    author_username: string;
}

let collaborationSchemaReady: Promise<void> | null = null;

function toFiniteNumber(value: unknown) {
    const numericValue = typeof value === "string" ? Number(value) : value;
    return typeof numericValue === "number" && Number.isFinite(numericValue) ? numericValue : 0;
}

function bufferToAvatarDataUrl(value: unknown): string | null {
    if (!value) {
        return null;
    }

    const buffer = Buffer.isBuffer(value)
        ? value
        : typeof value === "object" && value !== null && "type" in value && "data" in value
            ? Buffer.from((value as { data: number[] }).data)
            : null;

    if (!buffer || buffer.length === 0) {
        return null;
    }

    const mimeType = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47
        ? "image/png"
        : buffer[0] === 0xff && buffer[1] === 0xd8
            ? "image/jpeg"
            : buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46
                ? "image/gif"
                : buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
                    ? "image/webp"
                    : "application/octet-stream";

    return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

function avatarFallback(displayname: string | null, username: string) {
    const seed = displayname?.trim() || username.trim();
    return seed.charAt(0).toUpperCase() || "U";
}

function normalizeProfileRow(row: Record<string, unknown>): UserProfileSummary {
    const username = typeof row.a_username === "string" ? row.a_username : "user";
    const displayname = typeof row.a_displayname === "string" && row.a_displayname.trim()
        ? row.a_displayname
        : null;

    const contributions = toFiniteNumber(row.a_contributions);
    const repositories = toFiniteNumber(row.repo_count);
    const stars = toFiniteNumber(row.star_count);

    return {
        id: String(row.a_id ?? ""),
        email: typeof row.a_email === "string" ? row.a_email : "",
        username,
        displayname,
        bio: typeof row.a_description === "string" ? row.a_description : null,
        avatarUrl: bufferToAvatarDataUrl(row.a_pfp),
        joined: typeof row.a_joindate === "string" ? row.a_joindate : null,
        followers: toFiniteNumber(row.a_followers),
        following: toFiniteNumber(row.a_following),
        stats: {
            repositories,
            contributions,
            stars,
            totalContributions: contributions,
            longestStreak: Math.min(Math.max(Math.floor(contributions / 8), 0), 365),
            currentStreak: Math.min(Math.max(Math.floor(contributions / 20), 0), 90),
        },
    };
}

function decodeAvatarInput(avatarDataUrl?: string | null) {
    if (avatarDataUrl == null) {
        return undefined;
    }

    const trimmed = avatarDataUrl.trim();
    if (!trimmed) {
        return null;
    }

    const match = trimmed.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);
    if (!match) {
        throw new Error("Avatar must be a base64-encoded image data URL");
    }

    return Buffer.from(match[1], "base64");
}

async function ensureCollaborationSchema() {
    if (collaborationSchemaReady) {
        return collaborationSchemaReady;
    }

    collaborationSchemaReady = (async () => {
        await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type
          WHERE typname = 'pr_stat'
        ) THEN
          CREATE TYPE pr_stat AS ENUM ('Accepted', 'Rejected', 'Merged', 'Null');
        END IF;
      END
      $$;
    `);

        await pool.query(`
      CREATE TABLE IF NOT EXISTS pull_requests(
        pr_id BIGSERIAL PRIMARY KEY,
        acc_id BIGINT NOT NULL,
        repo_id BIGINT NOT NULL,
        pr_name VARCHAR(255) NOT NULL,
        pr_msg TEXT,
        pr_submit_date DATE,
        pr_resolve_date DATE,
        pr_creation_date DATE,
        pr_isOpen BOOLEAN NOT NULL DEFAULT TRUE,
        pr_status pr_stat NOT NULL DEFAULT 'Null',
        CONSTRAINT fk_pull_requests_acc
          FOREIGN KEY (acc_id) REFERENCES accounts(a_id) ON DELETE CASCADE,
        CONSTRAINT fk_pull_requests_repo
          FOREIGN KEY (repo_id) REFERENCES repositories(r_id) ON DELETE CASCADE
      );
    `);

        await pool.query(`
      CREATE TABLE IF NOT EXISTS repository_issues(
        i_id BIGSERIAL PRIMARY KEY,
        acc_id BIGINT NOT NULL,
        repo_id BIGINT NOT NULL,
        i_name VARCHAR(255) NOT NULL,
        i_msg TEXT,
        i_creationDate DATE,
        i_resolveDate DATE,
        i_open BOOLEAN DEFAULT TRUE,
        CONSTRAINT fk_repository_issues_acc
          FOREIGN KEY (acc_id) REFERENCES accounts(a_id) ON DELETE CASCADE,
        CONSTRAINT fk_repository_issues_repo
          FOREIGN KEY (repo_id) REFERENCES repositories(r_id) ON DELETE CASCADE
      );
    `);

        await pool.query(`CREATE INDEX IF NOT EXISTS idx_pr_repo_id ON pull_requests(repo_id);`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_issues_repo_id ON repository_issues(repo_id);`);
    })().catch((err) => {
        collaborationSchemaReady = null;
        throw err;
    });

    return collaborationSchemaReady;
}

async function syncRepoWorkItemMetrics(repoId: number, client?: Pool | import("pg").PoolClient) {
    await ensureCollaborationSchema();
    const executor = client ?? pool;
    await executor.query(
        `
      UPDATE repository_metrics SET
        "r_pullRequests" = (
          SELECT COUNT(*)
          FROM pull_requests
          WHERE repo_id = $1
        ),
        r_issues = (
          SELECT COUNT(*)
          FROM repository_issues
          WHERE repo_id = $1
        )
      WHERE repo_id = $1;
    `,
        [repoId]
    );
}

export async function getRepoOwnerId(repoId: number): Promise<number | null> {
    try {
        const cmd = "SELECT r_owner FROM repositories WHERE r_id = $1 LIMIT 1;";
        const res = await pool.query(cmd, [repoId]);
        const ownerId = res.rows[0]?.r_owner;
        return ownerId == null ? null : Number(ownerId);
    } catch (err) {
        console.error(err);
        return null;
    }
}

// createUser(DBUser) adds a new entry to the database
export async function createUser(user: DBUser) {
    try {
        const query = `
            INSERT INTO accounts (
                a_username,
                a_email,
                a_password,
                a_joindate
            )
            VALUES ($1, $2, $3, CURRENT_DATE)
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
export async function getUserInfo(email: string) {
    try {
        const cmd = "SELECT * FROM accounts WHERE a_email = $1;";
        const res = await pool.query(cmd, [email]);
        return res.rows[0];
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function getUserInfoById(userId: number) {
    try {
        const cmd = "SELECT * FROM accounts WHERE a_id = $1;";
        const res = await pool.query(cmd, [userId]);
        return res.rows[0] ?? null;
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function getUserProfile(userId: number): Promise<UserProfileSummary | null> {
    try {
        const cmd = `
            SELECT
                a.*,
                COALESCE(repo_counts.repo_count, 0) AS repo_count,
                COALESCE(repo_stats.star_count, 0) AS star_count
            FROM accounts a
            LEFT JOIN (
                SELECT r_owner, COUNT(*) AS repo_count
                FROM repositories
                GROUP BY r_owner
            ) repo_counts
            ON repo_counts.r_owner = a.a_id
            LEFT JOIN (
                SELECT r.r_owner, COALESCE(SUM(COALESCE(rm.r_stars, 0)), 0) AS star_count
                FROM repositories r
                LEFT JOIN repository_metrics rm
                ON rm.repo_id = r.r_id
                GROUP BY r.r_owner
            ) repo_stats
            ON repo_stats.r_owner = a.a_id
            WHERE a.a_id = $1
            LIMIT 1;
        `;
        const res = await pool.query(cmd, [userId]);
        return res.rows[0] ? normalizeProfileRow(res.rows[0]) : null;
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function updateUserProfile(
    userId: number,
    profile: {
        displayname?: string | null;
        description?: string | null;
        avatarDataUrl?: string | null;
    }
): Promise<UserProfileSummary | null> {
    const avatarBuffer = decodeAvatarInput(profile.avatarDataUrl);
    const cmd = `
        UPDATE accounts
        SET
            a_displayname = $2,
            a_description = $3,
            a_pfp = CASE
                WHEN $4::bytea IS NULL AND $5::boolean = TRUE THEN NULL
                WHEN $4::bytea IS NULL THEN a_pfp
                ELSE $4::bytea
            END
        WHERE a_id = $1
        RETURNING a_id;
    `;

    await pool.query(cmd, [
        userId,
        profile.displayname?.trim() || null,
        profile.description?.trim() || null,
        avatarBuffer ?? null,
        profile.avatarDataUrl === null,
    ]);

    return getUserProfile(userId);
}

export async function getUserProfileRepositories(userId: number): Promise<UserProfileRepoSummary[] | null> {
    try {
        const cmd = `
            SELECT
                r.r_id,
                r.r_name,
                r.r_url,
                owner.a_username AS owner_username,
                COALESCE(rm.r_stars, 0) AS stars,
                COALESCE(rm.r_forks, 0) AS forks
            FROM repositories r
            JOIN accounts owner
            ON owner.a_id = r.r_owner
            LEFT JOIN repository_metrics rm
            ON rm.repo_id = r.r_id
            WHERE r.r_owner = $1
            ORDER BY COALESCE(rm.r_stars, 0) DESC, r.r_id DESC;
        `;
        const res = await pool.query(cmd, [userId]);

        return res.rows.map((row) => ({
            id: String(row.r_id),
            name: typeof row.r_name === "string" ? row.r_name : "repository",
            description: typeof row.r_url === "string" ? `Repository URL: ${row.r_url}` : null,
            language: "CHZ",
            stars: toFiniteNumber(row.stars),
            forks: toFiniteNumber(row.forks),
            updatedAt: null,
            owner: typeof row.owner_username === "string" ? row.owner_username : "",
        }));
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
    try {
        const cmd = "SELECT a_password FROM accounts WHERE a_username = $1;";
        const res = await pool.query(cmd, [name]);
        return res.rows[0]?.a_password ?? null;
    } catch (err) {
        console.error(err);
        return null;
    }
}

// getRepoId(url), using id is better than urls as its naturally faster for searching
// so, get an id via url for simplicity then use said id to get other stuff
export async function getRepoId(url: string) {
    try {
        const cmd = "SELECT r_id FROM repositories WHERE r_url = $1;";
        const res = await pool.query(cmd, [url]);
        return res.rows[0]?.r_id ?? null;
    } catch (err) {
        console.error(err);
        return null;
    }
}

// getRepoData(id), for repo file explorer view
export async function getRepoData(id: BigInt) {
    try {
        const cmd = "SELECT * FROM repositories WHERE r_id = $1;";
        const res = await pool.query(cmd, [id]);
        return res.rows[0];
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function getRepoByOwnerAndName(owner: string, repo: string) {
    try {
        const basePath = `chizel.com/${owner}/${repo}`;
        const cmd = `
            SELECT *
            FROM repositories
            WHERE r_url = $1
            LIMIT 1;
        `;
        const res = await pool.query(cmd, [basePath]);
        return res.rows[0] ?? null;
    } catch (err) {
        console.error(err);
        return null;
    }
}

// getRepoPullRequests(id), for repo's pull requests
export async function getRepoPullRequests(id: BigInt) {
    try {
        await ensureCollaborationSchema();
        const cmd = `
            SELECT
                pr.*,
                a.a_username AS author_username
            FROM pull_requests pr
            JOIN accounts a
            ON a.a_id = pr.acc_id
            WHERE pr.repo_id = $1
            ORDER BY pr.pr_isOpen DESC, pr.pr_creation_date DESC, pr.pr_id DESC;
        `;
        const res = await pool.query(cmd, [id]);
        return res.rows;
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function getRepoPullRequestById(repoId: number, pullRequestId: number): Promise<RepoPullRequestRecord | null> {
    try {
        await ensureCollaborationSchema();
        const cmd = `
            SELECT
                pr.*,
                a.a_username AS author_username
            FROM pull_requests pr
            JOIN accounts a
            ON a.a_id = pr.acc_id
            WHERE pr.repo_id = $1
            AND pr.pr_id = $2
            LIMIT 1;
        `;
        const res = await pool.query<RepoPullRequestRecord>(cmd, [repoId, pullRequestId]);
        return res.rows[0] ?? null;
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function createRepoPullRequest(repoId: number, userId: number, title: string, message: string | null) {
    const client = await pool.connect();
    try {
        await ensureCollaborationSchema();
        await client.query("BEGIN");
        await ensureRepoMetricsRow(repoId);

        const cmd = `
            INSERT INTO pull_requests (
                acc_id,
                repo_id,
                pr_name,
                pr_msg,
                pr_submit_date,
                pr_creation_date
            )
            VALUES ($1, $2, $3, $4, CURRENT_DATE, CURRENT_DATE)
            RETURNING pr_id;
        `;
        const res = await client.query<{ pr_id: string }>(cmd, [userId, repoId, title, message]);
        await syncRepoWorkItemMetrics(repoId, client);
        await client.query("COMMIT");

        return res.rows[0]?.pr_id ?? null;
    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        return null;
    } finally {
        client.release();
    }
}

export async function updateRepoPullRequest(
    repoId: number,
    pullRequestId: number,
    title: string,
    message: string | null,
    isOpen: boolean,
    status: PullRequestStatus
) {
    try {
        await ensureCollaborationSchema();
        const cmd = `
            UPDATE pull_requests
            SET
                pr_name = $3,
                pr_msg = $4,
                pr_isOpen = $5,
                pr_status = $6,
                pr_resolve_date = CASE
                    WHEN $5 = TRUE THEN NULL
                    WHEN pr_resolve_date IS NULL THEN CURRENT_DATE
                    ELSE pr_resolve_date
                END
            WHERE repo_id = $1
            AND pr_id = $2
            RETURNING pr_id;
        `;
        const res = await pool.query<{ pr_id: string }>(cmd, [repoId, pullRequestId, title, message, isOpen, status]);
        return (res.rowCount ?? 0) > 0;
    } catch (err) {
        console.error(err);
        return false;
    }
}

export async function deleteRepoPullRequest(repoId: number, pullRequestId: number) {
    const client = await pool.connect();
    try {
        await ensureCollaborationSchema();
        await client.query("BEGIN");
        const cmd = `
            DELETE FROM pull_requests
            WHERE repo_id = $1
            AND pr_id = $2;
        `;
        const res = await client.query(cmd, [repoId, pullRequestId]);
        await syncRepoWorkItemMetrics(repoId, client);
        await client.query("COMMIT");
        return (res.rowCount ?? 0) > 0;
    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        return false;
    } finally {
        client.release();
    }
}

export async function getRepoIssues(repoId: number): Promise<RepoIssueRecord[] | null> {
    try {
        await ensureCollaborationSchema();
        const cmd = `
            SELECT
                i.*,
                a.a_username AS author_username
            FROM repository_issues i
            JOIN accounts a
            ON a.a_id = i.acc_id
            WHERE i.repo_id = $1
            ORDER BY i.i_open DESC, i.i_creationDate DESC, i.i_id DESC;
        `;
        const res = await pool.query<RepoIssueRecord>(cmd, [repoId]);
        return res.rows;
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function getRepoIssueById(repoId: number, issueId: number): Promise<RepoIssueRecord | null> {
    try {
        await ensureCollaborationSchema();
        const cmd = `
            SELECT
                i.*,
                a.a_username AS author_username
            FROM repository_issues i
            JOIN accounts a
            ON a.a_id = i.acc_id
            WHERE i.repo_id = $1
            AND i.i_id = $2
            LIMIT 1;
        `;
        const res = await pool.query<RepoIssueRecord>(cmd, [repoId, issueId]);
        return res.rows[0] ?? null;
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function createRepoIssue(repoId: number, userId: number, title: string, message: string | null) {
    const client = await pool.connect();
    try {
        await ensureCollaborationSchema();
        await client.query("BEGIN");
        await ensureRepoMetricsRow(repoId);

        const cmd = `
            INSERT INTO repository_issues (
                acc_id,
                repo_id,
                i_name,
                i_msg,
                i_creationDate
            )
            VALUES ($1, $2, $3, $4, CURRENT_DATE)
            RETURNING i_id;
        `;
        const res = await client.query<{ i_id: string }>(cmd, [userId, repoId, title, message]);
        await syncRepoWorkItemMetrics(repoId, client);
        await client.query("COMMIT");

        return res.rows[0]?.i_id ?? null;
    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        return null;
    } finally {
        client.release();
    }
}

export async function updateRepoIssue(
    repoId: number,
    issueId: number,
    title: string,
    message: string | null,
    isOpen: boolean
) {
    try {
        await ensureCollaborationSchema();
        const cmd = `
            UPDATE repository_issues
            SET
                i_name = $3,
                i_msg = $4,
                i_open = $5,
                i_resolveDate = CASE
                    WHEN $5 = TRUE THEN NULL
                    WHEN i_resolveDate IS NULL THEN CURRENT_DATE
                    ELSE i_resolveDate
                END
            WHERE repo_id = $1
            AND i_id = $2
            RETURNING i_id;
        `;
        const res = await pool.query<{ i_id: string }>(cmd, [repoId, issueId, title, message, isOpen]);
        return (res.rowCount ?? 0) > 0;
    } catch (err) {
        console.error(err);
        return false;
    }
}

export async function deleteRepoIssue(repoId: number, issueId: number) {
    const client = await pool.connect();
    try {
        await ensureCollaborationSchema();
        await client.query("BEGIN");
        const cmd = `
            DELETE FROM repository_issues
            WHERE repo_id = $1
            AND i_id = $2;
        `;
        const res = await client.query(cmd, [repoId, issueId]);
        await syncRepoWorkItemMetrics(repoId, client);
        await client.query("COMMIT");
        return (res.rowCount ?? 0) > 0;
    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        return false;
    } finally {
        client.release();
    }
}

// getUserRepos(name), fetches all repos owned/contributed by user
export async function getUserRepos(name: string) {
    try {
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
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function getUserId(user: string): Promise<BigInt | null> {
    try {
        const cmd = `SELECT a_id FROM accounts WHERE a_username = $1;`;
        const res = await pool.query(cmd, [user]);
        return res.rows[0]?.a_id ?? null;

    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function getRepoMetrics(rid: number) {
    try {
        const cmd = `SELECT * FROM repository_metrics WHERE repo_id = $1 LIMIT 1;`
        const res = await pool.query(cmd, [rid]);

        return res.rows[0] ?? null;
    } catch (err) {
        console.log(err);
        return null;
    }
}

export async function ensureRepoMetricsRow(rid: number) {
    try {
        const cmd = `
            INSERT INTO repository_metrics (repo_id, r_stars, r_watchers, r_forks, "r_pullRequests", r_issues)
            SELECT $1, 0, 0, 0, 0, 0
            WHERE NOT EXISTS (
                SELECT 1
                FROM repository_metrics
                WHERE repo_id = $1
            );
        `;

        await pool.query(cmd, [rid]);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

export async function isStarredRepo(uid: number, rid: number): Promise<boolean> {
    try {
        const cmd = `SELECT 1 FROM repository_stars WHERE user_id = $1 AND repo_id = $2;`;
        const res = await pool.query(cmd, [uid, rid]);

        return (res.rowCount ?? 0) > 0;

    } catch (err) {
        console.error(err);
        return false;
    }
}

export async function isWatchedRepo(uid: number, rid: number): Promise<boolean> {
    try {
        const cmd = `SELECT 1 FROM repository_watchers WHERE user_id = $1 AND repo_id = $2;`;
        const res = await pool.query(cmd, [uid, rid]);

        return (res.rowCount ?? 0) > 0;

    } catch (err) {
        console.error(err);
        return false;
    }
}

export async function starRepo(uid: number, rid: number) {
    const client = await pool.connect();
    try {
        await ensureRepoMetricsRow(rid);
        await client.query("BEGIN");

        const alreadyStarred = await client.query(
            `SELECT 1 FROM repository_stars WHERE user_id = $1 AND repo_id = $2;`,
            [uid, rid]
        );

        let viewerHasStarred: boolean;

        if ((alreadyStarred.rowCount ?? 0) === 0) {
            await client.query(
                `INSERT INTO repository_stars (user_id, repo_id) VALUES ($1, $2);`,
                [uid, rid]
            );
            await client.query(
                `UPDATE repository_metrics
                 SET r_stars = COALESCE(r_stars, 0) + 1
                 WHERE repo_id = $1;`,
                [rid]
            );
            viewerHasStarred = true;
        } else {
            await client.query(
                `DELETE FROM repository_stars WHERE user_id = $1 AND repo_id = $2;`,
                [uid, rid]
            );
            await client.query(
                `UPDATE repository_metrics
                 SET r_stars = GREATEST(COALESCE(r_stars, 0) - 1, 0)
                 WHERE repo_id = $1;`,
                [rid]
            );
            viewerHasStarred = false;
        }

        const metricsRes = await client.query(
            `SELECT * FROM repository_metrics WHERE repo_id = $1 LIMIT 1;`,
            [rid]
        );

        await client.query("COMMIT");

        return {
            ...(metricsRes.rows[0] ?? {}),
            viewerHasStarred,
            viewerIsWatching: await isWatchedRepo(uid, rid),
        };
    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        return null;
    } finally {
        client.release();
    }
}

export async function watchRepo(uid: number, rid: number) {
    const client = await pool.connect();
    try {
        await ensureRepoMetricsRow(rid);
        await client.query("BEGIN");

        const alreadyWatching = await client.query(
            `SELECT 1 FROM repository_watchers WHERE user_id = $1 AND repo_id = $2;`,
            [uid, rid]
        );

        let viewerIsWatching: boolean;

        if ((alreadyWatching.rowCount ?? 0) === 0) {
            await client.query(
                `INSERT INTO repository_watchers (user_id, repo_id) VALUES ($1, $2);`,
                [uid, rid]
            );
            await client.query(
                `UPDATE repository_metrics
                 SET r_watchers = COALESCE(r_watchers, 0) + 1
                 WHERE repo_id = $1;`,
                [rid]
            );
            viewerIsWatching = true;
        } else {
            await client.query(
                `DELETE FROM repository_watchers WHERE user_id = $1 AND repo_id = $2;`,
                [uid, rid]
            );
            await client.query(
                `UPDATE repository_metrics
                 SET r_watchers = GREATEST(COALESCE(r_watchers, 0) - 1, 0)
                 WHERE repo_id = $1;`,
                [rid]
            );
            viewerIsWatching = false;
        }

        const metricsRes = await client.query(
            `SELECT * FROM repository_metrics WHERE repo_id = $1 LIMIT 1;`,
            [rid]
        );

        await client.query("COMMIT");

        return {
            ...(metricsRes.rows[0] ?? {}),
            viewerHasStarred: await isStarredRepo(uid, rid),
            viewerIsWatching,
        };
    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        return null;
    } finally {
        client.release();
    }
}

export default pool;
