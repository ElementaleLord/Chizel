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

int lcs(Lines new_file, Lines old_file)
{
    int index_new = 0;
    int index_old = 0;

    while(index_new <= new_file.size ||  index_old <= old_file.size)
    {
    }
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

    return 0;
}
