#include "chzdb.h"
#include <ctype.h>
#include <zlib.h>
#include <sys/stat.h>

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
    env_file = fopen("../.env", "r");
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

        #ifdef _WIN32
            _putenv_s(key, value);
        #else
            setenv(key, value, 0);
        #endif
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

bool fillRepoData(RepositoryChz* repo){
    char path[1024];
    FILE* f;

    memset(repo, 0, sizeof(*repo));

    f = fopen(ORIGIN_FILE, "r");
    if(!f){
        return false;
    }
    if(!fgets(repo->repoURL, sizeof(repo->repoURL), f)){
        fclose(f);
        return false;
    }
    fclose(f);
    repo->repoURL[strcspn(repo->repoURL, "\r\n")] = '\0';

    f = fopen(DESC_PATH, "r");
    if(!f){
        return false;
    }
    if(!fgets(repo->repoName, sizeof(repo->repoName), f)){
        fclose(f);
        return false;
    }
    fclose(f);
    repo->repoName[strcspn(repo->repoName, "\r\n")] = '\0';
    
    snprintf(path, 1024, "%s/blobs.pack", PACK_PUSH_PATH);
    FILE* pack = fopen(path, "rb");
    if(!pack){
        return false;
    }

    fseek(pack, 0, SEEK_END);
    long pack_size = ftell(pack);
    rewind(pack);

    if(pack_size < 0){
        fclose(pack);
        return false;
    }
    size_t size = (size_t)pack_size;

    repo->data = malloc(size);
    if(!repo->data){
        fclose(pack);
        return false;
    }

    repo->dataLen = fread(repo->data, 1, size, pack);
    fclose(pack);

    if(repo->dataLen != size){
        free(repo->data);
        repo->data = NULL;
        repo->dataLen = 0;
        return false;
    }

    return true;
}

//~ Uploads a repository
bool uploadToDB(){
    const char *params[4];
    unsigned char *data_buffer = NULL;
    PGconn *conn;
    PGresult *res;

    RepositoryChz repo;
    if(!fillRepoData(&repo)){
        return false;
    }

    if (repo.repoName[0] == '\0' || repo.repoURL[0] == '\0'){
        free(repo.data);
        return false;
    }

    if ((conn = openDB()) == NULL){
        free(repo.data);
        return false;
    }

    size_t escapedLen = 0;      // for PQescapeByteaConn
    //# convertion to BYTEA
    if (repo.data != NULL && repo.dataLen > 0){
        data_buffer = PQescapeByteaConn(conn, repo.data, repo.dataLen, &escapedLen);
        if (data_buffer == NULL){
            PQfinish(conn);
            free(repo.data);
            return false;
        }
    }

    params[0] = repo.repoURL;
    params[1] = repo.repoName;
    params[2] = (const char *)data_buffer;

    res = PQexecParams(
        conn,
        "INSERT INTO repositories (r_url, r_name, r_chz) "
        "VALUES ($1, $2, $3) "
        "ON CONFLICT (r_url) DO UPDATE SET "
        "r_name = EXCLUDED.r_name, "
        "r_chz = EXCLUDED.r_chz",
        3, NULL, params, NULL, NULL, 0);

    if(res == NULL){
        printf(CHZ_ERROR_MSG_START"Upload failed: %s\n"MSG_END, PQerrorMessage(conn));
        if (data_buffer != NULL){
            PQfreemem(data_buffer);
        }
        free(repo.data);
        PQfinish(conn);
        return false;
    }

    if (PQresultStatus(res) != PGRES_COMMAND_OK){
        printf(CHZ_ERROR_MSG_START"Upload failed: %s\n"MSG_END, PQerrorMessage(conn));
        PQclear(res);
        if (data_buffer != NULL){
            PQfreemem(data_buffer);
        }
        free(repo.data);
        PQfinish(conn);
        return false;
    }

    PQclear(res);
    if (data_buffer != NULL){
        PQfreemem(data_buffer);
    }
    PQfinish(conn);
    free(repo.data);
    return true;
}

//~ Places fetched data into objects/restored
bool placeRestored(PGresult* data){
    if(data == NULL || PQntuples(data) < 1 || PQnfields(data) < 1 || PQgetisnull(data, 0, 0)){
        PQclear(data);
        return false;
    }

    char* bytes = PQgetvalue(data, 0, 0);
    int len = PQgetlength(data, 0, 0);

    char output[1024];
    snprintf(output, 1024, "%s/pulled.pack", PACK_PULL_PATH);
    FILE* f = fopen(output, "wb");
    if(!f){
        PQclear(data);
        return false;
    }

    fwrite(bytes, 1, len, f);
    fclose(f);
    PQclear(data);
    return true;
}

//~ Restores content from the db via link. If not passed, uses origin
bool restoreFromDB(const char* link){
    const char *params[1];
    PGconn *conn;
    PGresult *res;
    char cmd[255];

    if ((conn = openDB()) == NULL){
        return NULL;
    }

    snprintf(cmd, sizeof(cmd), "SELECT r_chz FROM repositories WHERE r_url = $1");
    params[0] = link;

    res = PQexecParams(conn, cmd, 1, NULL, params, NULL, NULL, 1);

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
    return placeRestored(res);
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