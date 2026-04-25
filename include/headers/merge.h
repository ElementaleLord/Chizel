#include "../chizel.h"

#ifndef MERGE_H
#define MERGE_H

    void merge(int argc, char *argv[]);

    void lcsConflicts(const char *base_conflict, const char *relative_path);
    int countDirectory(const char *path);
    int getFileHash(const char *path, char out_buffer[65]);
    int checkSum(const char *file1, const char *file2);
    int fastForwardMerge(char *branch);
    bool copyFile(const char *src, const char *dest);
    bool searchSameName(const char *dest, const char *fileName, const char *src);
    void curMerge(char *head, char *branch);

#endif