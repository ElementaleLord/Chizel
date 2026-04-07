#include "chzdb.h"
#include <ctype.h>

//& Database
//~ Trim leading space
static char *skipLeadingSpace(char *text){
    while (*text != '\0' && isspace((unsigned char)*text)){
        text++;
    }

    return text;
}

//~ Trim trailing space
static void trimTrailingSpace(char *text){
    size_t len = strlen(text);

    while (len > 0 && isspace((unsigned char)text[len - 1])){
        text[len - 1] = '\0';
        len--;
    }
}

//~ Remove wrapping quotes
static void stripQuotes(char *text){
    size_t len = strlen(text);

    if (len >= 2 && text[0] == '"' && text[len - 1] == '"'){
        memmove(text, text + 1, len - 2);
        text[len - 2] = '\0';
    }
}

//~ Load .env values
static void loadEnv(void){
    static bool loaded = false;
    FILE *env_file;
    char line[4096];

    if (loaded){
        return;
    }

    loaded = true;
    env_file = fopen(".env", "r");
    if (env_file == NULL){
        return;
    }

    while (fgets(line, sizeof(line), env_file) != NULL){
        char *key;
        char *value;
        char *equals;

        line[strcspn(line, "\r\n")] = '\0';
        key = skipLeadingSpace(line);

        if (key[0] == '\0' || key[0] == '#'){
            continue;
        }

        equals = strchr(key, '=');
        if (equals == NULL){
            continue;
        }

        *equals = '\0';
        value = skipLeadingSpace(equals + 1);
        trimTrailingSpace(key);
        trimTrailingSpace(value);
        stripQuotes(value);

        if (key[0] == '\0' || getenv(key) != NULL){
            continue;
        }

        setenv(key, value, 0);
    }

    fclose(env_file);
}

//~ Establish db connection
static PGconn *openDB(void){
    const char *db_key = getenv("DB_KEY");
    PGconn *conn;

    if (db_key == NULL || db_key[0] == '\0'){
        loadEnv();
        db_key = getenv("DB_KEY");
    }

    if (db_key == NULL || db_key[0] == '\0'){
        printf(CHZ_ERROR_MSG_START"DB Key not found"MSG_END);
        return NULL;
    }

    conn = PQconnectdb(db_key);

    if (PQstatus(conn) != CONNECTION_OK){
        printf(CHZ_ERROR_MSG_START"Connection failed: %s\n"MSG_END, PQerrorMessage(conn));
        PQfinish(conn);
        return NULL;
    }

    return conn;
}

//~ Checks for missing values or potential injections
bool checkContraband(const char *s){
    if(s == NULL || s[0] == '\0'){ return false; }

    size_t i;

    if(!(isalpha((unsigned char)s[0]) || s[0] == '_')){ return false; }

    for(i=1; s[i] != '\0'; i++){
        if(!(isalnum((unsigned char)s[i]) || s[i] == '_')){ return false; }
    }

    return true;
}

//~ Format a repository creation date to SQL DATE
static bool formatRepoDate(time_t raw_date, char *buffer, size_t buffer_size){
    struct tm date_info;

    if (localtime_r(&raw_date, &date_info) == NULL){
        return false;
    }

    return strftime(buffer, buffer_size, "%d-%m-%Y", &date_info) != 0;
}

//~ Serialize contributors to BIGINT[] text
static bool formatContributors(const RepositoryChz *repo, char *buffer, size_t buffer_size){
    size_t used = 0;

    if (repo->contributors == NULL || repo->contributorCount == 0){
        if (buffer_size < 3){
            return false;
        }

        strcpy(buffer, "{}");
        return true;
    }

    used = (size_t)snprintf(buffer, buffer_size, "{");
    if (used >= buffer_size){
        return false;
    }

    for (size_t i = 0; i < repo->contributorCount; i++){
        int written = snprintf(
            buffer + used,
            buffer_size - used,
            i == 0 ? "%lld" : ",%lld",
            repo->contributors[i]
        );

        if (written < 0 || (size_t)written >= buffer_size - used){
            return false;
        }

        used += (size_t)written;
    }

    if (used + 2 > buffer_size){
        return false;
    }

    buffer[used++] = '}';
    buffer[used] = '\0';
    return true;
}

//~ Uploads a repository
bool uploadRepo(RepositoryChz repo){
    const char *params[8];
    char id_buffer[32];
    char date_buffer[16];
    char followers_buffer[32];
    char stars_buffer[32];
    char contributors_buffer[512];
    unsigned char *data_buffer = NULL;
    PGconn *conn;
    PGresult *res;

    if (repo.repoName == NULL){
        return false;
    }

    if ((conn = openDB()) == NULL){
        return false;
    }

    //# libpq expects text parameters here, so numeric fields are formatted
    snprintf(id_buffer, sizeof(id_buffer), "%lld", repo.id);
    if (!formatRepoDate(repo.repoDate, date_buffer, sizeof(date_buffer))){
        PQfinish(conn);
        return false;
    }

    snprintf(followers_buffer, sizeof(followers_buffer), "%lld", repo.followers);
    snprintf(stars_buffer, sizeof(stars_buffer), "%lld", repo.stars);
    if (!formatContributors(&repo, contributors_buffer, sizeof(contributors_buffer))){
        PQfinish(conn);
        return false;
    }

    //# repo contents are stored as a BYTEA blob in SQL
    if (repo.data != NULL && sizeof(repo.data) > 0){
        data_buffer = PQescapeByteaConn(conn, repo.data, sizeof(repo.data), NULL);
        if (data_buffer == NULL){
            PQfinish(conn);
            return false;
        }
    }

    params[0] = id_buffer;
    params[1] = repo.repoName;
    params[2] = date_buffer;
    params[3] = repo.repoURL;
    params[4] = followers_buffer;
    params[5] = stars_buffer;
    params[6] = contributors_buffer;
    params[7] = (const char *)data_buffer;

    res = PQexecParams(
        conn,
        "INSERT INTO repositories (r_id, r_name, r_creationDate, r_url, r_followers, r_stars, r_contributors, r_chz) "
        "VALUES ($1, $2, $3, $4, $5, $6, $7, $8) "
        "ON CONFLICT (r_id) DO UPDATE SET "
        "r_name = EXCLUDED.r_name, "
        "r_creationDate = EXCLUDED.r_creationDate, "
        "r_url = EXCLUDED.r_url, "
        "r_followers = EXCLUDED.r_followers, "
        "r_stars = EXCLUDED.r_stars, "
        "r_contributors = EXCLUDED.r_contributors, "
        "r_chz = EXCLUDED.r_chz",
        8, NULL, params, NULL, NULL, 0);

    if (PQresultStatus(res) != PGRES_COMMAND_OK){
        printf(CHZ_ERROR_MSG_START"Upload failed: %s\n"MSG_END, PQerrorMessage(conn));
        PQclear(res);
        if (data_buffer != NULL){
            PQfreemem(data_buffer);
        }
        PQfinish(conn);
        return false;
    }

    PQclear(res);
    if (data_buffer != NULL){
        PQfreemem(data_buffer);
    }
    PQfinish(conn);
    return true;
}

//~ Restores content via table, wanted content, a condition with its value
PGresult* restoreFromDB(const char* table, const char* content, const char* condition, const char* cond_value){
    const char *params[1];
    PGconn *conn;
    PGresult *res;
    char cmd[255];

    if (!checkContraband(table) || !checkContraband(content) || !checkContraband(condition)){
        return NULL;
    }

    if(cond_value == NULL){
        return NULL;
    }

    if ((conn = openDB()) == NULL){
        return NULL;
    }

    params[0] = cond_value;
    snprintf(cmd, sizeof(cmd), "SELECT %s FROM %s WHERE %s = $1", content, table, condition);

    res = PQexecParams(conn, cmd, 1, NULL, params, NULL, NULL, 0);

    //# checks query success
    if (PQresultStatus(res) != PGRES_TUPLES_OK){
        printf(CHZ_ERROR_MSG_START"Restore failed: %s\n"MSG_END, PQerrorMessage(conn));
        PQclear(res);
        PQfinish(conn);
        return NULL;
    }

    //# checks if no data is returned (rows)
    if (PQntuples(res) == 0){
        PQclear(res);
        PQfinish(conn);
        return NULL;
    }

    PQfinish(conn);
    return res;
}

//^ O: The following snippet shows how you iterate through the result
void loopThroughPGresult(PGresult* res){
    if(res != NULL){
        int rows = PQntuples(res);
        int cols = PQnfields(res);

        for(int i=0; i<rows; i++){
            // full row 1
            for(int j=0; j<cols; j++){
                // row 1 field 1
            }
        }
    }

    PQclear(res); //! MAKE SURE TO CLEAR THE POINTER
}

//& Database
