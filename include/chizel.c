#include "chizel.h"
#include <ctype.h>
#include <errno.h>
#include <dirent.h>
#include <sys/stat.h>
#include <postgresql/libpq-fe.h>

//& General
//~ helper used to print a string representation of the current error number
void whatIsTheError()
{
    printf("Error String: %s.\n", strerror(errno));
}

//~ helper used to check if .chz exists
bool checkChz()
{
    DIR* p_dir = opendir(CHZ_PATH);
    
    if(!p_dir)
    {
        printf("CHZ ERROR: .chz Directory Does Not Exists.\n");
        whatIsTheError();
        return false;
    }
    
    closedir(p_dir);
    return true;
}

bool checkForFile(char *file)
{
    struct stat st;
    return stat(file, &st) == 0 && !S_ISDIR(st.st_mode);
}

bool checkStagingArea(){
    FILE* staging_area = fopen(STAGING_AREA_PATH, "r");
    if(staging_area == NULL){
        printf(ADD_ERROR_MSG_START"Could Not Open Stage Area"MSG_END);
        whatIsTheError();
        return false;
    }
    char line[1024];
    struct stat st;
    bool all_exist = true;

    while(fgets(line, sizeof(line), staging_area) != NULL){
        line[strcspn(line, "\n")] = '\0';
        if(line[0] == '\0'){
            continue;
        }
        if(stat(line,&st) != 0){
            printf("Missing File: %s\n", line);
            all_exist = false;
        }
    }
    fclose(staging_area);
    return all_exist;
}

FILE* getStagingArea()
{
    FILE* staging_area = fopen(STAGING_AREA_PATH, "r");
    if(staging_area == NULL){
        printf("No Files In Staging Area"MSG_END);
        return NULL;
    }
    return staging_area;
}

bool clearStagingArea()
{
    FILE* staging_area = fopen(STAGING_AREA_PATH, "w");
    if(staging_area != NULL){
        fclose(staging_area);
        printf("Cleared staging area.\n");
        return true;
    }else{
        return false;
    }
}
//& General

//& .chzignore
//~ make relative path from full path and root path (getcwd)
const char* makeRelativePath(const char* fullpath, const char* root_path)
{
    size_t root_len = strlen(root_path);
    //# strncmp compares the characters of fullpath and root_path with a max of root_len characters
    //# for each character, if fullpath's character is bigger than root_path's character, return 1
    //# if smaller, return -1 and if equal return 0, if 0 continue on the next character until root_len compares
    //# here we check if the fullpath (built by going through directories) and root_path (getcwd) are the same
    if (strncmp(fullpath, root_path, root_len) == 0 &&
        (fullpath[root_len] == '\\' || fullpath[root_len] == '/'))
    {
        return fullpath + root_len + 1;
    }
    return fullpath;
}


//~ checks if the file is ignored using its name, extension or relative path
bool checkIgnore(char* file, const char* relative_path){
    if(relative_path == NULL || relative_path[0] == '\0')
    {
        //# No parameter
        return false;
    }
    FILE* ignoreFile = fopen(IGNORE_FILE, "r");
    if(ignoreFile == NULL){
        //# no ignores to check
        return true;
    }
    char line[256];
    while(fgets(line, sizeof(line), ignoreFile) != NULL){
        line[strcspn(line,"\r\n")] = '\0';
        if(line[0] == '\0'){
            //# empty line
            continue;
        }
        if(strcmp(line, file) == 0)
        {
            //# file name found, ignored
            fclose(ignoreFile);
            return false;
        }
        if(strcmp(line, relative_path) == 0)
        {
            //# path found, ignored
            fclose(ignoreFile);
            return false;
        }
        //# example: *.exe
        if(line[0] == '*' && line[1] == '.'){
            //# getting the last occurence of "." inside the line to determine the extension of the files that need to be ignored
            //# then get the extension, compare with the -size of the extension and see if the file has same extention
            const char* index = strrchr(file, '.');
            if(index != NULL && strcmp(index, line + 1) == 0)
            {
                //# same extension
                fclose(ignoreFile);
                return false;
            }
        }
        size_t len = strlen(line);
        if(len > 0 && line[len - 1] == '/')
        {
            if(strncmp(relative_path, line, len) == 0)
            {
                //# same relative path
                fclose(ignoreFile);
                return false;
            }
        }
    }
    fclose(ignoreFile);
    return true;
}
//& .chzignore

//& LCS
//~ 
#define lines_append(res, line)\
    do{\
        if(res.size >= res.capacity)\
        {\
            if(res.size == 0) res.capacity = 256;\
            else res.capacity *= 2;\
            res.content = realloc(res.content, res.capacity * sizeof(*res.content));\
        }\
        res.content[res.size++] = line;\
    } while(0)

int max(int a, int b) { return (a > b) ? a : b; }

//~ 
Lines read_file(FILE* f)
{
    Lines result = {0};
    char line[1024];
    while(fgets(line, sizeof(line), f))
    {
        lines_append(result, strdup(line));
    }
    
    return result;
}

//~ 
char **lcs_backtrack(Lines new_file, Lines old_file, int lcs_table[old_file.size+1][new_file.size+1], int len)
{
    size_t i = old_file.size;
    size_t j = new_file.size;
    int k = len - 1;
    char **lcs_lines = malloc(len * sizeof(char *));

    while(i > 0 && j > 0)
    {
        if(strcmp(old_file.content[i-1], new_file.content[j-1]) == 0)
        {
            printf(" %s", old_file.content[i-1]);
            i--;
            j--;
        }
        else if(lcs_table[i-1][j] >= lcs_table[i][j-1]) 
        {
            printf("- %s", old_file.content[i-1]);
            i--;
        }
        else 
        {
            printf("+ %s", new_file.content[j-1]);
            j--;
        }
        
        while(i > 0) { printf("- %s",old_file.content[i - 1]); i--;} 
        while(j > 0) { printf("+ %s",old_file.content[j - 1]); j--;} 
    }

    return lcs_lines;
}

//~ 
int lcs(Lines new_file, Lines old_file)
{
    int lcs_table[old_file.size + 1][new_file.size + 1];

    //# lcs of first file vs line 0 of new file
    for(int i = 0; i < old_file.size; i++)
    {
        lcs_table[i][0] = 0;
    }
    
    //# lcs of new file vs line 0 of old file
    for(int j = 0; j < old_file.size; j++)
    {
        lcs_table[0][j] = 0;
    }

    
    for(int i = 1; i <= old_file.size; i++)
    {
        for(int j = 1; j <= new_file.size; j++)
        {
            if(strcmp(old_file.content[i-1], new_file.content[j-1])) lcs_table[i][j] = lcs_table[i - 1][j - 1] + 1;
            else lcs_table[i][j] = max(lcs_table[i-1][j], lcs_table[i][j-1]);
        }
    }

    int len = lcs_table[old_file.size][new_file.size];
    char **lcs_lines = lcs_backtrack(new_file, old_file, lcs_table, len);

    return len;
}
//& LCS

//& Database
//~ Trim leading space.
static char *skipLeadingSpace(char *text)
{
    while (*text != '\0' && isspace((unsigned char)*text))
    {
        text++;
    }

    return text;
}

//~ Trim trailing space.
static void trimTrailingSpace(char *text)
{
    size_t len = strlen(text);

    while (len > 0 && isspace((unsigned char)text[len - 1]))
    {
        text[len - 1] = '\0';
        len--;
    }
}

//~ Remove wrapping quotes.
static void stripQuotes(char *text)
{
    size_t len = strlen(text);

    if (len >= 2 && text[0] == '"' && text[len - 1] == '"')
    {
        memmove(text, text + 1, len - 2);
        text[len - 2] = '\0';
    }
}

//~ Load .env values.
static void loadDotEnv(void)
{
    static bool loaded = false;
    FILE *env_file;
    char line[4096];

    if (loaded)
    {
        return;
    }

    loaded = true;
    env_file = fopen(".env", "r");
    if (env_file == NULL)
    {
        return;
    }

    while (fgets(line, sizeof(line), env_file) != NULL)
    {
        char *key;
        char *value;
        char *equals;

        line[strcspn(line, "\r\n")] = '\0';
        key = skipLeadingSpace(line);

        if (key[0] == '\0' || key[0] == '#')
        {
            continue;
        }

        equals = strchr(key, '=');
        if (equals == NULL)
        {
            continue;
        }

        *equals = '\0';
        value = skipLeadingSpace(equals + 1);
        trimTrailingSpace(key);
        trimTrailingSpace(value);
        stripQuotes(value);

        if (key[0] == '\0' || getenv(key) != NULL)
        {
            continue;
        }

        setenv(key, value, 0);
    }

    fclose(env_file);
}

//~ Establish db connection.
static PGconn *openDB(void)
{
    const char *db_key = getenv("DB_KEY");
    PGconn *conn;

    if (db_key == NULL || db_key[0] == '\0')
    {
        loadDotEnv();
        db_key = getenv("DB_KEY");
    }

    if (db_key == NULL || db_key[0] == '\0')
    {
        fprintf(stderr, "Missing DB_KEY.\n");
        return NULL;
    }

    conn = PQconnectdb(db_key);

    if (PQstatus(conn) != CONNECTION_OK)
    {
        fprintf(stderr, "Connection failed: %s\n", PQerrorMessage(conn));
        PQfinish(conn);
        return NULL;
    }

    return conn;
}

//~ Create table.
static int createTable(PGconn *conn)
{
    PGresult *res = PQexec(
        conn,
        "CREATE TABLE IF NOT EXISTS test ("
        "name TEXT PRIMARY KEY, "
        "content TEXT NOT NULL)"
    );

    if (PQresultStatus(res) != PGRES_COMMAND_OK)
    {
        fprintf(stderr, "Table setup failed: %s\n", PQerrorMessage(conn));
        PQclear(res);
        return 1;
    }

    PQclear(res);
    return 0;
}

//~ Uploads content by name.
int uploadToDB(const char *name, const char *content)
{
    const char *params[2];
    PGconn *conn;
    PGresult *res;

    if (name == NULL || content == NULL)
    {
        return 1;
    }

    conn = openDB();
    if (conn == NULL)
    {
        return 1;
    }

    if (createTable(conn) != 0)
    {
        PQfinish(conn);
        return 1;
    }

    params[0] = name;
    params[1] = content;

    res = PQexecParams(
        conn,
        "INSERT INTO test (name, content) "
        "VALUES ($1, $2) "
        "ON CONFLICT (name) DO UPDATE "
        "SET content = EXCLUDED.content",
        2,
        NULL,
        params,
        NULL,
        NULL,
        0
    );

    if (PQresultStatus(res) != PGRES_COMMAND_OK)
    {
        fprintf(stderr, "Upload failed: %s\n", PQerrorMessage(conn));
        PQclear(res);
        PQfinish(conn);
        return 1;
    }

    PQclear(res);
    PQfinish(conn);
    return 0;
}

//~ Restores content by name.
char *restoreFromDB(const char *name)
{
    const char *params[1];
    PGconn *conn;
    PGresult *res;
    char *copy;
    const char *value;

    if (name == NULL)
    {
        return NULL;
    }

    conn = openDB();
    if (conn == NULL)
    {
        return NULL;
    }

    if (createTable(conn) != 0)
    {
        PQfinish(conn);
        return NULL;
    }

    params[0] = name;

    res = PQexecParams(
        conn,
        "SELECT content FROM test WHERE name = $1",
        1,
        NULL,
        params,
        NULL,
        NULL,
        0
    );

    if (PQresultStatus(res) != PGRES_TUPLES_OK)
    {
        fprintf(stderr, "Restore failed: %s\n", PQerrorMessage(conn));
        PQclear(res);
        PQfinish(conn);
        return NULL;
    }

    if (PQntuples(res) == 0)
    {
        PQclear(res);
        PQfinish(conn);
        return NULL;
    }

    value = PQgetvalue(res, 0, 0);
    copy = malloc(strlen(value) + 1);
    if (copy == NULL)
    {
        PQclear(res);
        PQfinish(conn);
        return NULL;
    }

    strcpy(copy, value);
    PQclear(res);
    PQfinish(conn);
    return copy;
}
//& Database
