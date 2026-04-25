#include "chizel.h"
#include "headers/tag.h"
#include <postgresql/libpq-fe.h>

#ifndef CHZDB_H
#define CHZDB_H

    #define CHZ_PUSH 0
    #define CHZ_TAG 1
    #define STORE_DATA 2

    typedef struct{
        char* data;
        size_t len;
    }Buffer;

    typedef struct
    {
        unsigned int pathLen;
        unsigned long long blobLen;
        unsigned int isDir;
    } Blob;

    int zipDirectory(int mode);
    int restorePack(const char *pack_path, const char *output_path);
    bool restoreFromDB(const char* link);
    bool uploadToDB();

#endif