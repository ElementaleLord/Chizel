#include "../../include/lcs_algos.h"
#include <string.h>
#include <stdio.h>
#include <fcntl.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>

#define lines_append(res, line)\
    do{\
        if(res.size >= res.capacity)\
        {\
            if(res.size == 0) res.capacity = 256;\
            else res.capacity *= 2;\
            res.lines = realloc(res.lines, res.capacity * sizeof(*res.lines));\
        }\
        res.lines[res.size++] = line;\
    } while(0)

int max(int a, int b) { return (a > b) ? a : b; }

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

char **lcs_backtrack(Lines new_file, Lines old_file, int lcs_table[old_file.size+1][new_file.size+1], int len)
{
    size_t i = old_file.size;
    size_t j = new_file.size;
    int k = len - 1;
    char **lcs_lines = malloc(len * sizeof(char *));

    while(i > 0 && j > 0)
    {
        if(strcmp(old_file.lines[i-1], new_file.lines[j-1]) == 0)
        {
            printf(" %s", old_file.lines[i-1]);
            i--;
            j--;
        }
        else if(lcs_table[i-1][j] >= lcs_table[i][j-1]) 
        {
            printf("- %s", old_file.lines[i-1]);
            i--;
        }
        else 
        {
            printf("+ %s", new_file.lines[j-1]);
            j--;
        }
        
        while(i > 0) { printf("- %s",old_file.lines[i - 1]); i--;} 
        while(j > 0) { printf("+ %s",old_file.lines[j - 1]); j--;} 
    }

    return lcs_lines;
}

int lcs(Lines new_file, Lines old_file)
{
    int lcs_table[old_file.size + 1][new_file.size + 1];

    //lcs of first file vs line 0 of new file
    for(int i = 0; i < old_file.size; i++)
    {
        lcs_table[i][0] = 0;
    }
    
    //lcs of new file vs line 0 of old file
    for(int j = 0; j < old_file.size; j++)
    {
        lcs_table[0][j] = 0;
    }

    
    for(int i = 1; i <= old_file.size; i++)
    {
        for(int j = 1; j <= new_file.size; j++)
        {
            if(strcmp(old_file.lines[i-1], new_file.lines[j-1])) lcs_table[i][j] = lcs_table[i - 1][j - 1] + 1;
            else lcs_table[i][j] = max(lcs_table[i-1][j], lcs_table[i][j-1]);
        }
    }

    int len = lcs_table[old_file.size][new_file.size];
    char **lcs_lines = lcs_backtrack(new_file, old_file, lcs_table, len);

    return len;
}

int main()
{
    FILE* new_file = fopen("test1.txt", "r");
    if(new_file == NULL)
    {
        perror("Failed in opening the file");
        exit(EXIT_FAILURE);
    }
    Lines new_file_lines = read_file(new_file);
    fclose(new_file);

    FILE* old_file = fopen("test2.txt", "r");
    if(old_file == NULL)
    {
        perror("Failed in opening the file");
        exit(EXIT_FAILURE);
    }
    Lines old_file_lines = read_file(old_file);
    fclose(old_file);

    int result = lcs(new_file_lines, old_file_lines);
    printf("LCS: %d\n", result);

    return 0;
}