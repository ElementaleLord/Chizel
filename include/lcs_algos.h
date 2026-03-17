#ifndef LCS_ALGOS_H
#define LCS_ALGOS_H

typedef struct
{
    int start_old;
    int start_new;
    int lines_removed;
    int lines_added; 
}Changes;

int max(int x, int y);
int lcsRec(char* s1, char* s2, int m, int n);
int lcs(char* s1, char* s2);

#endif