#include "chizel.h"
#include <postgresql/libpq-fe.h>

#ifndef CHZDB_H
#define CHZDB_H

    typedef struct{
        char* data;
        size_t len;
    }Buffer;

    typedef struct{
        unsigned int pathLen;
        unsigned long long blobLen;
        unsigned int isDir;
    }Blob;

    bool restoreFromDB(const char* link);
    bool uploadToDB();

#endif