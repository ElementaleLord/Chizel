#include "../../include/lcs_algos.h"
#include <string.h>
#include <stdio.h>
#include <fcntl.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>

typedef struct{
    char** lines;
    size_t capacity;
    size_t size;
} Lines;

#define lines_append(res, line)\
    do{\
        if(res.size >= res.capacity)\
        {\
            if(res.size == 0) res.capacity = 256;\
            else res.capacity *= 2;\
            res.lines = realloc(res.lines, res.capacity * siezeof(*res.lines));\
        }\
        res.lines[res.size++] = line;\
    } while(0)

char** read_file(FILE* f)
{
    char result[1024][1024];
    char line[1024];
    while(fgets(line, sizeof(line), f))
    {
       
    }
    
    return result;
}

int max(int x, int y)
{
    return x > y ? x : y;
}

int lcsRec(char* s1, char* s2, int m, int n)
{
    // any of the strings is empty
    if(m == 0 || n == 0) return 0;

    // same last character
    if(s1[m-1] == s2[n-1]) return (1 + lcsRec(s1, s2, m-1, n-1));

    // recur twice, each time excluding the last char of a string, then take the maximum
    else return max(lcsRec(s1, s2, m , n-1), lcsRec(s1, s2, m-1, n));
}

int lcs(char* s1, char* s2)
{
    int m = strlen(s1);
    int n = strlen(s2);
    
    return lcsRec(s1, s2, m, n);
}

//int f_lcs(FILE* f1, FILE* f2, Changes* current)
//{
//    int result = 0;
//    char line_new[1024], line_old[1024];
//    while(fgets(line_new, sizeof(line_new), f1) != NULL && fgets(line_old, sizeof(line_old), f2) != NULL)
//    {
//        result += lcs(line_new, line_old);
//    } 
//    return 0;
//}

int main()
{
    char* a = "AGGTAB";
    char* b = "GXTXAYB";
    Lines res = {"line"};

    for(int i = 0; i < 12; i++) lines_append(res, "line");
    for(size_t i = 0; i < res.size; i++) printf("%

    FILE* file1 = fopen("test1.txt", "r");
    if(file1 == NULL)
    {
        perror("Failed in opening the file");
        exit(EXIT_FAILURE);
    }
    FILE* file2 = fopen("test2.txt", "r");
    if(file2 == NULL)
    {
        perror("Failed in opening the file");
        exit(EXIT_FAILURE);
    }

    fclose(file1);
    fclose(file2);
    return 0;

}