#include "chizel.h"
#include <fcntl.h>
#include <errno.h>
#include <unistd.h>
#include <dirent.h>
#include <sys/types.h>
#include <sys/stat.h>
//$ p: refactor header includes

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