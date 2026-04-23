#include "add.c"
#include "branch.c"
#include "checkout.c"
#include "clone.c"
#include "fetch.c"
#include "init.c"
#include "log.c"
#include "merge.c"
#include "pull.c"
#include "push.c"
#include "status.c"
#include "tag.c"

int main(int argc, char *argv[]){
    if(argc<2)
    {
        printf("Usage: chz <command>\n");
        return 1;
    }

    if(strcmp(argv[1], "init")==0){
        init(argc, argv);
    }

    else if(strcmp(argv[1], "add")==0){
        return add(argc, argv);
    }

    else if(strcmp(argv[1], "branch")==0){
        return branch(argc, argv);
    }

    else if(strcmp(argv[1], "checkout")==0){
        return checkout(argc, argv);
    }

    else if(strcmp(argv[1], "commit")==0){
        return commit(argc, argv);
    }

    else if(strcmp(argv[1], "describe")==0){
        return describe(argc, argv);
    }

    else if(strcmp(argv[1], "fetch")==0){
        return fetch(argc, argv);
    }

    else if(strcmp(argv[1], "merge")==0){
        return merge(argc, argv);
    }

    else if(strcmp(argv[1], "pull")==0){
        return pull(argc, argv);
    }

    else if(strcmp(argv[1], "status")==0){
        return status(argc, argv);
    }

    else if(strcmp(argv[1], "tag")==0){
        return tag(argc, argv);
    }

    printf(CHZ_ERROR_MSG_START"Invalid Command"MSG_END);
    return 1;
}
//gcc main.c init.c -o chz
//! shi requires a lot of work :/