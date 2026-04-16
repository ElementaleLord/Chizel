#ifndef COMMIT_METHODS_H
#define COMMIT_METHODS_H

#include <zlib.h>
#include <unistd.h>
                                    
//Struct to read the content of a commit
typedef struct
{
    char tree_hash[65];
    char parent_hash[65];
    void* data;
    char* author;
    char* message;
    time_t commit_date;
}CommitObject;

#endif
