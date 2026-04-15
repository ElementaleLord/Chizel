#include "chizel.h"
#include <cstdio>
#include <ctype.h>
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

//~ helper used to print a string representation of the current error number
void whatIsTheError()
{
    printf("Error String: %s.\n", strerror(errno));
}

//~ helper used to check if .chz exists
int checkChz()
{
    /*
    DIR* p_dir = opendir(CHZ_PATH);
    
    if(!p_dir)
    {
        printf("CHZ ERROR: .chz Directory Does Not Exists.\n");
        whatIsTheError();
        return false;
    }
    
    closedir(p_dir);
    return true;*/

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
