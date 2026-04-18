#include "chizel.h"
#include <ctype.h>
#include <unistd.h>
#include <zlib.h>
#include <errno.h>
#include <dirent.h>
#include <sys/stat.h>

//& General
//~
#define dynamic_append(d_arr, val)\
    do{\
        if(d_arr.size >= d_arr.capacity)\
        {\
            if(d_arr.size == 0) d_arr.capacity = 256;\
            else d_arr.capacity *= 2;\
            void *temp = realloc(d_arr.content, d_arr.capacity * sizeof(*d_arr.content));\
            if(!temp)\
            {\
                perror("realloc failed");\
                exit(1);\
            }\
            d_arr.content = temp;\
        }\
        d_arr.content[d_arr.size++] = val;\
    }while(0)


int max(int a, int b) { return (a > b) ? a : b; }

//~ Reverses a string, log reads from end to beginning of line
void reverseString(char* s){
    size_t len = strlen(s);

    for(size_t i=0; i< len/2; i++){
        char tmp = s[i];
        s[i] = s[len-i-1];
        s[len-i-1] = tmp;
    }
}

//~ helper used to print a string representation of the current error number
void whatIsTheError()
{
    printf("Error String: %s.\n", strerror(errno));
}

//~ Returns the head
char* getHead(){
    static char head[256];
    FILE* f = fopen(HEAD_PATH, "r");
    if(!f){
        printf(CHZ_ERROR_MSG_START"Error opening HEAD"MSG_END);
        return NULL;
    }

    if(fgets(head, sizeof(head), f) == NULL){
        printf(CHZ_ERROR_MSG_START"Error reading HEAD"MSG_END);
        return NULL;
    }
    fclose(f);

    head[strcspn(head, "\n")] = '\0';  // replace newline
    char* prefix = "refs/heads/";

    if(strncmp(head, prefix, strlen(prefix)) == 0){
        memmove(head, head + strlen(prefix), strlen(head + strlen(prefix)) + 1);
    }

    return head;
}

//~ helper used to check if .chz exists
int checkChz()
{
    DIR* pdir = opendir(CHZ_PATH);
    if(pdir)
    {
        closedir(pdir);
        return 1;
    }
    //# file doesnt exist
    if(errno == ENOENT) return 0;
    //# permission error or other issues
    return -1;
}

bool checkForFile(char *file)
{
    struct stat st;
    return stat(file, &st) == 0 && !S_ISDIR(st.st_mode);
}

int checkStagingArea()
{
    FILE *staging_area = fopen(STAGING_AREA_PATH, "r");
    FILE *temp_file;
    char line[1024];
    struct stat st;
    if (staging_area == NULL)
    {
        printf(ADD_ERROR_MSG_START "Could Not Open Stage Area" MSG_END);
        whatIsTheError();
        return 0;
    }
    temp_file = fopen(".chz/staging_area.tmp", "w");
    if (temp_file == NULL)
    {
        printf(ADD_ERROR_MSG_START "Could Not Create Temp Stage Area" MSG_END);
        whatIsTheError();
        fclose(staging_area);
        return 0;
    }
    while (fgets(line, sizeof(line), staging_area) != NULL)
    {
        line[strcspn(line, "\n")] = '\0';
        if (line[0] == '\0')
        {
            continue;
        }
        if (stat(line, &st) == 0)
        {
            //# FILE EXISTS, WRITE
            fprintf(temp_file, "%s\n", line);
        }
        else
        {   
            //# FILE DOESNT EXIST, DONT WRITE
            continue;
        }
    }
    fclose(staging_area);
    fclose(temp_file);
    remove(STAGING_AREA_PATH);
    rename(".chz/staging_area.tmp", STAGING_AREA_PATH);
    return 1;
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

Lines readStagingArea()
{
    Lines index_content = {0};
    FILE *f_ptr = fopen(INDEX_PATH, "r");
    char line[256];
    while(fgets(line,sizeof(line), f_ptr))
    {
        dynamic_append(index_content, strdup(line));
    }
    return index_content;
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
Lines read_file(FILE* f)
{
    Lines result = {0};
    char line[1024];
    while(fgets(line, sizeof(line), f))
    {
        dynamic_append(result, strdup(line));
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

//& Commit Methods
int load_commit_object(FILE* obj_ptr, CommitObject* out_commit) 
{
    size_t BUF_SIZE = 16384; 
    unsigned char* raw_buffer = malloc(BUF_SIZE + 1);
    if (!raw_buffer) return -1;
    
    z_stream strm = {0};
    unsigned char in_buf[4096];
    strm.next_in = in_buf;
    strm.avail_in = fread(in_buf, 1, sizeof(in_buf), obj_ptr);
    strm.next_out = raw_buffer;
    strm.avail_out = BUF_SIZE;

    inflateInit(&strm);
    int ret = inflate(&strm, Z_FINISH);
    inflateEnd(&strm);

    if (ret != Z_STREAM_END && ret != Z_OK) {
        free(raw_buffer);
        return -1; 
    }
    raw_buffer[strm.total_out] = '\0';

    memset(out_commit, 0, sizeof(CommitObject));

    char* buffer_ptr = (char*)raw_buffer;
    char* null_ptr = strchr(buffer_ptr, '\0');
    if (!null_ptr) {
        free(raw_buffer);
        return -1;
    }
    
    char* payload = null_ptr + 1;

    char* line = payload;
    while (line && *line != '\0') {
        
        if (*line == '\n') {
            size_t msg_len = strlen(line + 1);
            out_commit->message = malloc(msg_len + 1);
            strcpy(out_commit->message, line + 1);
            break; 
        }

        char* next_line = strchr(line, '\n');
        if (next_line) {
            *next_line = '\0'; 
        }

        if (strncmp(line, "tree ", 5) == 0) {
            strncpy(out_commit->tree_hash, line + 5, 64);
        }
        else if (strncmp(line, "parent ", 7) == 0) {
            strncpy(out_commit->parent_hash, line + 7, 64);
        }
        else if (strncmp(line, "author ", 7) == 0) {
            char* email_end = strchr(line, '>');
            if (email_end) {
                size_t author_len = email_end - (line + 7) + 1;
                out_commit->author = malloc(author_len + 1);
                strncpy(out_commit->author, line + 7, author_len);
                out_commit->author[author_len] = '\0';
                
                out_commit->commit_date = (time_t)strtol(email_end + 2, NULL, 10);
            }
        }

        if (next_line) {
            line = next_line + 1;
        } else {
            break;
        }
    }

    free(raw_buffer);
    return 1;
}

void walk_history(const char* start_hash) 
{
    char current_hash[65];
    strncpy(current_hash, start_hash, 64);
    current_hash[64] = '\0';

    while (strlen(current_hash) > 0) 
    {
        char obj_path[512];
        snprintf(
                obj_path, 
                sizeof(obj_path), 
                "%s/%.2s/%s", 
                 OBJECTS_PATH, 
                 current_hash, 
                 current_hash + 2
                 );

        FILE* obj_ptr = fopen(obj_path, "rb");
        if (!obj_ptr) break; 

        CommitObject commit;
        if (load_commit_object(obj_ptr, &commit) > 0) 
        {
            printf("commit %s\n", current_hash);
            printf("Author: %s\n", commit.author);
            printf("Date:   %s", ctime(&commit.commit_date));
            printf("\n    %s\n\n", commit.message);

            strncpy(current_hash, commit.parent_hash, 64);
            
            if (commit.author) free(commit.author);
            if (commit.message) free(commit.message);
        }

        fclose(obj_ptr);
        
        if (current_hash[0] == '\0') break;
    }
}

int get_object_path(char* out_path)
{
    char object_hash[64];
    char branch_path[1024]; 

    int status = checkChz(); 
    if(status == 0)
    {
        printf(COMMIT_ERROR_MSG_START".chz workspace not initialized"MSG_END);
        whatIsTheError();
        printf(COMMIT_REPORT_MSG_START"initialize, .chz with chz init before running any chz operations"MSG_END);
        return -1;
    }
    else if(status < 0)
    {
        printf(COMMIT_ERROR_MSG_START"failed to access .chz workspace"MSG_END);
        whatIsTheError();
        return -1;
    }

    char* head = getHead();
    if(head == NULL){
        return -1;
    }
    snprintf(branch_path, sizeof(branch_path), "%s/%s", REFS_HEADS_PATH, head);
    
    FILE* hash_ptr = fopen(branch_path, "r");
    if(!hash_ptr)
    {
        perror("Failed to read from branch head ref");
        return -1;
    }

    if(!fgets(object_hash, sizeof(object_hash), hash_ptr))
    {
        perror("Failed to read commit hash");
        fclose(hash_ptr); 
        return -1;
    }
    fclose(hash_ptr);

    object_hash[strcspn(object_hash, "\r\n")] = 0;
    snprintf(out_path, 256, "%s/%.2s/%s", OBJECTS_PATH, object_hash, object_hash + 2);

    return 1;
}

//~ replaces instances of \n with \\n, so that it appears as \n without actual newlines
char* newlineFake(char* msg){
    size_t extra = 0;

    for(const char *p = msg; *p; p++){
        if(*p == '\n'){
            extra++;
        }
    }

    char *out = malloc(strlen(msg) + extra + 1);
    if(out == NULL){
        return NULL;
    }

    char* dst = out;
    for(const char *src = msg; *src; src++){
        if(*src == '\n'){
            *dst++ = '\\';
            *dst++ = 'n';
        }else{
            *dst++ = *src;
        }
    }

    *dst = '\0';
    return out;
}

//~ Restores fake newlines for outputs (\\n -> \n) and stops after the first encounter
char* newlineRestoreShort(char* message){
    char *shortMsg = malloc(strlen(message) + 1);
    if(shortMsg == NULL){
        return NULL;
    }
    char *shrt = shortMsg;
    bool shortCont = true;

    for(const char *src = message; *src; src++){
        if(src[0] == '\\' && src[1] == 'n'){
            src++;
            shortCont = false;
        }else{
            if(shortCont){
                *shrt++ = *src;
            }
        }
    }
    *shrt = '\0';
    return shortMsg;
}

//~ Restores fake newlines for outputs (\\n -> \n)
char* newlineRestore(char* message){
    char *fixedMsg = malloc(strlen(message) + 1);
    if(fixedMsg == NULL){
        return NULL;
    }
    char *dst = fixedMsg;
    bool shortCont = true;

    for(const char *src = message; *src; src++){
        if(src[0] == '\\' && src[1] == 'n'){
            *dst++ = '\n';
            src++;
        }else{
            *dst++ = *src;
        }
    }
    *dst = '\0';
    return fixedMsg;
}

//~ From the specified information, add a new entry log to the specified branch's logs
int addLogEntry(){
    char objPath[1024];

    if(get_object_path(objPath) < 0){
        return -1;
    }

    FILE* obj_ptr = fopen(objPath, "rb");
    if(!obj_ptr){
        return -1;
    }

    CommitObject commit;
    if(load_commit_object(obj_ptr, &commit) < 0){
        fclose(obj_ptr);
        return -1;
    }
    fclose(obj_ptr);

    struct dirent *dir;
    char path[1024];

    snprintf(path, sizeof(path), "%s%s.log", LOGS_PATH, getHead());
    FILE* logs = fopen(path, "a");
    if(!logs){
        return -1;
    }

    char content[5124];

    if(commit.author == NULL){
        return -1;
    }
    if(strcmp(commit.author, "ChizelUser <user@example.com>") == 0){
        commit.author = "local  null";
    }

    commit.message = newlineFake(commit.message);

    snprintf(content, sizeof(content), "%s  %s  %s  %ld  \"%s\"\n", commit.tree_hash, commit.parent_hash, commit.author, commit.commit_date, commit.message);
    int r = fputs(content, logs);
    fclose(logs);

    return r;
}
//& Commit Methods