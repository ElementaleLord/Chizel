#include <sys/types.h>

#ifndef LCS_ALGOS_H
#define LCS_ALGOS_H

typedef struct{
    char** lines;
    size_t capacity;
    size_t size;
} Lines;

int lcs(Lines s1, Lines s2);

#endif