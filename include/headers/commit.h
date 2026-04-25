#include "../chizel.h"
#include "../chzdb.h"

#ifndef COMMIT_H
#define COMMIT_H

    void commit(int argc, char* argv[]);

    #define ZERO_HASH "0000000000000000000000000000000000000000"

    typedef struct
    {
        char tree_hash[65];
        char parent_hash[65];
        void *data;
        char *author; // username & email
        char *message;
        time_t commit_date;
    } CommitObject;

    int get_object_path(char *out_path);
    int load_commit_object(FILE *obj_ptr, CommitObject *out_commit);
    void walk_history(const char *start_hash);

#endif