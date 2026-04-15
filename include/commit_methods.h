#ifndef COMMIT_METHODS_H
#define COMMIT_METHODS_H

#include <zlib.h>
#include <unistd.h>
                                    
typedef struct
{
    char* parent;
    time_t t;
    char* author;
    char* message;

}CommitObject;

#endif
