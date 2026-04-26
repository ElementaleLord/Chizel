#include "chzdb.h"
#include <ctype.h>
#include <dirent.h>
#include <zlib.h>

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
    
    snprintf(path, 1024, "%s/compacted.pack", PACK_PUSH_PATH);
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
//& Packed Files
//~ Compresses raw bytes from memory and returns buffer
int compressBuffer(const unsigned char *data, size_t len, unsigned char **outBuf, size_t *outLen)
{
    z_stream zs = {0};

    // compression init
    if (deflateInit(&zs, Z_BEST_COMPRESSION) != Z_OK)
    {
        return -1;
    }

    size_t cap = 4096;                // buffer capacity
    unsigned char *buf = malloc(cap); // buffer for data
    if (!buf)
    {
        deflateEnd(&zs); // cleanup, duh
        return -1;
    }

    // straight from Faust :>
    zs.next_in = (Bytef *)data; // pointer to next byte to be inputted
    zs.avail_in = len;          // bytes available
    size_t written = 0;         // tracker
    int ret;                    // return value from deflation

    do
    {
        if (written == cap)
        {
            cap *= 2;
            unsigned char *tmp = realloc(buf, cap);
            if (!tmp)
            {
                free(buf);
                deflateEnd(&zs);
                return -1;
            }
            buf = tmp;
        }

        zs.next_out = buf + written;  // write after produced bytes
        zs.avail_out = cap - written; // space left

        // might as well not define a whole new var for this
        ret = deflate(&zs, zs.avail_in > 0 ? Z_NO_FLUSH : Z_FINISH); // compression
        written = cap - zs.avail_out;
    } while (ret != Z_STREAM_END);

    deflateEnd(&zs);
    *outBuf = buf;     // return compressed buffer
    *outLen = written; // return length of compressed data
    return 1;
}

//~ Reads a file via memory then returns a pointer to it
char *readRaw(const char *path, size_t *fileSize)
{
    FILE *fptr = fopen(path, "rb"); //! YES I USED RB. WE NEED IT IN BINARY
    if (!fptr)
    {
        return NULL;
    }

    fseek(fptr, 0, SEEK_END);
    long size = ftell(fptr);
    rewind(fptr);

    if (size < 0)
    {
        fclose(fptr);
        return NULL;
    }

    char *buf = malloc(size);
    if (!buf)
    {
        fclose(fptr);
        return NULL;
    }

    size_t bytesRead = fread(buf, 1, size, fptr);
    fclose(fptr);

    if (bytesRead != (size_t)size)
    { // incase less or more than the actual byte count
        free(buf);
        return NULL;
    }

    *fileSize = bytesRead;
    return buf;
}

int appendBlobFile(const char *relative, int isDir,
                   const unsigned char *compressed, size_t compressed_len,
                   const char *packPath)
{

    char path[4096];
    snprintf(path, sizeof(path), "%s", packPath);

    FILE *pack = fopen(path, "ab");
    if (!pack)
    {
        return -1;
    }

    Blob hdr;
    hdr.pathLen = strlen(relative);
    hdr.isDir = isDir;
    hdr.blobLen = hdr.isDir ? 0 : compressed_len;

    if (fwrite(&hdr, sizeof(hdr), 1, pack) != 1)
    {
        fclose(pack);
        return -1;
    }

    if (fwrite(relative, 1, hdr.pathLen, pack) != hdr.pathLen)
    {
        fclose(pack);
        return -1;
    }

    if (!isDir && (!compressed || compressed_len == 0))
    {
        fclose(pack);
        return -1;
    }

    if (!isDir)
    {
        if (fwrite(compressed, 1, compressed_len, pack) != compressed_len)
        {
            fclose(pack);
            return -1;
        }
    }

    fclose(pack);
    return 1;
}

//~ Recursively walks the dir, uploading subdir metadata and compressing files
int pushPath(const char *root, const char *relative, const char *packPath, int command)
{
    char full_path[4096];
    struct stat st, fpath;

    if (strncmp(relative, ".chz/objects/compressed/", 25) == 0)
    {
        return 1;
    }

    if (command != CHZ_PUSH && strncmp(relative, ".chz", 5) == 0)
    {
        return 1;
    }

    if (command == CHZ_PUSH)
    {
        const char *name = strrchr(relative, '/');
        if (!name)
        {
            name = relative;
        }
        else
        {
            name++;
        }

        if (strcmp(name, "ignored.pack") == 0)
        {
            return 1;
        }
    }

    if (relative[0] == '\0')
    {
        snprintf(full_path, sizeof(full_path), "%s", root);
    }
    else
    {
        snprintf(full_path, sizeof(full_path), "%s/%s", root, relative);
    }

    if (stat(full_path, &st) != 0)
    {
        return -1;
    }

    if (S_ISDIR(st.st_mode))
    {
        if (relative[0] != '\0')
        {
            if (appendBlobFile(relative, 1, NULL, 0, packPath) != 1)
            {
                return -1;
            }
        }

        DIR *dir = opendir(full_path);
        if (!dir)
            return -1;

        struct dirent *entry;
        while ((entry = readdir(dir)) != NULL)
        {
            if (strcmp(entry->d_name, ".") == 0 || strcmp(entry->d_name, "..") == 0)
            {
                continue;
            }

            if (command != CHZ_PUSH && strcmp(entry->d_name, ".chz") == 0)
            {
                continue;
            }
            char newPath[4096] = {0};
            char rootPath[1024];

            getcwd(rootPath, sizeof(rootPath));
            // check ignore

            if (command == STORE_DATA)
            {
                char ignorePath[4096] = {0};
                snprintf(ignorePath, sizeof(ignorePath), "%s/%s/ignored.pack", DATA_PATH, getHead());

                if (checkIgnore(entry->d_name, makeRelativePath(full_path, rootPath)))
                {
                    // NOT ignored
                    snprintf(newPath, sizeof(newPath), "%s", packPath);
                }
                else
                {
                    // ignored
                    snprintf(newPath, sizeof(newPath), "%s", ignorePath);
                }
            }
            else if (command == CHZ_TAG && checkIgnore(entry->d_name, makeRelativePath(full_path, rootPath)))
            {
                snprintf(newPath, sizeof(newPath), "%s", packPath);
            }
            else
            {
                snprintf(newPath, sizeof(newPath), "%s", packPath);

                if (!checkIgnore(entry->d_name, makeRelativePath(full_path, rootPath)))
                {
                    continue;
                }
            }

            char child_rel[4096];
            if (relative[0] == '\0')
            {
                snprintf(child_rel, sizeof(child_rel), "%s", entry->d_name);
            }
            else
            {
                snprintf(child_rel, sizeof(child_rel), "%s/%s", relative, entry->d_name);
            }
            if (newPath[0] == '\0')
            {
                snprintf(newPath, sizeof(newPath), "%s", packPath);
            }

            if (pushPath(root, child_rel, newPath, command) != 1)
            {
                closedir(dir);
                return -1;
            }
        }

        closedir(dir);
        return 1;
    }

    if (S_ISREG(st.st_mode))
    { // is regular file
        size_t file_size;
        char *raw = readRaw(full_path, &file_size);
        if (!raw)
        {
            return -1;
        }

        unsigned char *compressed = NULL;
        size_t compressed_len = 0;

        if (compressBuffer((unsigned char *)raw, file_size, &compressed, &compressed_len) == -1)
        {
            free(raw);
            return -1;
        }

        char newPath[4096] = {0};
        char rootPath[1024];

        getcwd(rootPath, sizeof(rootPath));

        bool ignored = false;

        char ignorePath[4096] = {0};
        snprintf(ignorePath, sizeof(ignorePath), "%s/%s/ignored.pack", DATA_PATH, getHead());

        if (command == STORE_DATA)
        {
            if (checkIgnore(full_path, makeRelativePath(full_path, rootPath)))
            {
                // NOT ignored
                snprintf(newPath, sizeof(newPath), "%s", packPath);
            }
            else
            {
                // ignored
                snprintf(newPath, sizeof(newPath), "%s", ignorePath);
            }
        }
        else
        {
            snprintf(newPath, sizeof(newPath), "%s", packPath);

            if (!checkIgnore(full_path, makeRelativePath(full_path, rootPath)))
            {
                ignored = true;
            }
        }

        if (newPath[0] == '\0')
        {
            snprintf(newPath, sizeof(newPath), "%s", packPath);
        }

        if (!ignored)
        {
            if (appendBlobFile(relative, 0, compressed, compressed_len, newPath) != 1)
            {
                free(raw);
                free(compressed);
                return -1;
            }
        }

        free(raw);
        free(compressed);
        return 1;
    }

    return 1;
}

//~ Starts the compression process, mode is either CHZ_PUSH, STORE_DATA or CHZ_TAG (!!USE setTag(tagName) BEFORE USING CHZ_TAG!!)
int zipDirectory(int mode)
{
    char curpath[4096];
    if (getcwd(curpath, sizeof(curpath)) == NULL)
    {
        printf(PUSH_REPORT_MSG_START "Could not access workin directory" MSG_END);
        return -1;
    }

    char pack[4096];
    if (mode == CHZ_PUSH)
    {
        snprintf(pack, sizeof(pack), "%s/compacted.pack", PACK_PUSH_PATH);
    }
    else if (mode == CHZ_TAG)
    {
        snprintf(pack, sizeof(pack), "%s/%s.pack", TAGS_DATA_PATH, getTag());
    }
    else
    {
        snprintf(pack, sizeof(pack), "%s/%s/data.pack", DATA_PATH, getHead());
    }

    FILE *pfile = fopen(pack, "wb");
    if (!pfile)
    {
        return -1;
    }

    fclose(pfile);

    int result = pushPath(curpath, "", pack, mode); // "" as in root
    if (mode == CHZ_TAG)
    {
        remove(TAG_NAME_FILE);
    }
    return result;
}

//~ Inflates compressed bytes
int decompressBuffer(const unsigned char *data, size_t len, unsigned char **out_buf, size_t *out_len)
{
    z_stream zs = {0};
    if (inflateInit(&zs) != Z_OK)
    {
        return -1;
    }

    size_t cap = 4096;
    unsigned char *buf = malloc(cap);
    if (!buf)
    {
        inflateEnd(&zs);
        return -1;
    }

    zs.next_in = (Bytef *)data;
    zs.avail_in = len;

    size_t written = 0;
    int ret;

    do
    {
        if (written == cap)
        {
            cap *= 2;
            unsigned char *temp = realloc(buf, cap);
            if (!temp)
            {
                free(buf);
                inflateEnd(&zs);
                return -1;
            }
            buf = temp;
        }

        zs.next_out = buf + written;
        zs.avail_out = cap - written;

        ret = inflate(&zs, Z_NO_FLUSH);
        written = cap - zs.avail_out;

        if (ret == Z_STREAM_ERROR || ret == Z_DATA_ERROR || ret == Z_MEM_ERROR)
        {
            free(buf);
            inflateEnd(&zs);
            return -1;
        }

    } while (ret != Z_STREAM_END);

    inflateEnd(&zs);
    *out_buf = buf;
    *out_len = written;
    return 0;
}

//~ Constructs files via blobs
int restoreFile(const char *path, const unsigned char *compressed_data, size_t compressed_len)
{
    unsigned char *raw = NULL;
    size_t raw_len = 0;

    if (decompressBuffer(compressed_data, compressed_len, &raw, &raw_len) != 0)
    {
        return -1;
    }

    FILE *f_ptr = fopen(path, "wb");
    if (!f_ptr)
    {
        free(raw);
        return -1;
    }

    fwrite(raw, 1, raw_len, f_ptr);
    fclose(f_ptr);
    free(raw);
    return 1;
}

int ensureParentDirs(const char *path)
{
    char tmp[4096];
    snprintf(tmp, sizeof(tmp), "%s", path);

    for (char *p = tmp + 1; *p; p++)
    {
        if (*p == '/')
        {
            *p = '\0';
#ifdef _WIN32
            mkdir(tmp);
#else
            mkdir(tmp, 0777);
#endif
            *p = '/';
        }
    }

    return 1;
}

//~ Restores the content of pack_path in output_path (relative paths)
int restorePack(const char *pack_path, const char *output_path)
{
    FILE *pack = fopen(pack_path, "rb");
    if (!pack)
    {
        return -1;
    }

    while (1)
    {
        Blob hdr;
        size_t n = fread(&hdr, sizeof(hdr), 1, pack);

        if (n == 0)
        {
            break;
        }

        if (n != 1)
        {
            fclose(pack);
            return -1;
        }

        char rel_path[4096];
        if (hdr.pathLen >= 4096)
        {
            fclose(pack);
            return -1;
        }

        if (fread(rel_path, 1, hdr.pathLen, pack) != hdr.pathLen)
        {
            fclose(pack);
            return -1;
        }
        rel_path[hdr.pathLen] = '\0';

        char full_path[4096 + 4];
        snprintf(full_path, sizeof(full_path), "%s/%s", output_path, rel_path);

        if (hdr.isDir)
        {
            ensureParentDirs(full_path);
#ifdef _WIN32
            mkdir(full_path);
#else
            mkdir(full_path, 0777);
#endif
            continue;
        }

        unsigned char *compressed = malloc(hdr.blobLen);
        if (!compressed)
        {
            fclose(pack);
            return -1;
        }

        if (fread(compressed, 1, hdr.blobLen, pack) != hdr.blobLen)
        {
            free(compressed);
            fclose(pack);
            return -1;
        }

        ensureParentDirs(full_path);

        if (restoreFile(full_path, compressed, hdr.blobLen) != 1)
        {
            free(compressed);
            fclose(pack);
            return -1;
        }

        free(compressed);
    }

    fclose(pack);
    return 1;
}

//~ Deletes all content of a directory, IGNORES .chz, "." is for current directory
int removeDir(const char *path)
{
    if (strcmp(path, "/") == 0)
        return -1;
    char base[2048];

#ifdef _WIN32
    if (_fullpath(base, path, sizeof(base)) == NULL)
    {
        return -1;
    }
#else
    if (realpath(path, base) == NULL)
    {
        return -1;
    }
#endif

    DIR *dir = opendir(base);
    if (!dir)
    {
        return -1;
    }

    struct dirent *entry;
    char full_path[4096];

    while ((entry = readdir(dir)) != NULL)
    {
        if (strcmp(entry->d_name, ".") == 0 || strcmp(entry->d_name, "..") == 0)
        {
            continue;
        }

        if (strcmp(entry->d_name, ".chz") == 0)
        {
            continue;
        }

        snprintf(full_path, sizeof(full_path), "%s/%s", base, entry->d_name);

        struct stat st;
        if (stat(full_path, &st) != 0)
        {
            closedir(dir);
            return -1;
        }

        if (S_ISDIR(st.st_mode))
        {
            if (removeDir(full_path) != 1)
            {
                closedir(dir);
                return -1;
            }

            if (rmdir(full_path) != 0)
            {
                closedir(dir);
                return -1;
            }
        }
        else
        {
            if (remove(full_path) != 0)
            {
                closedir(dir);
                return -1;
            }
        }
    }

    closedir(dir);
    return 1;
}
//& Packed Files