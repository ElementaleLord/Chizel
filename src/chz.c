#include "../include/chz.h"

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
        add(argc, argv);
    }

    else if(strcmp(argv[1], "branch")==0){
        branch(argc, argv);
    }

    else if(strcmp(argv[1], "checkout")==0){
        checkout(argc, argv);
    }

    else if(strcmp(argv[1], "commit")==0){
        commit(argc, argv);
    }

    else if(strcmp(argv[1], "fetch")==0){
        return fetch(argc, argv);
    }

    else if(strcmp(argv[1], "log")==0){
        logs(argc, argv);
    }

    else if(strcmp(argv[1], "merge")==0){
        merge(argc, argv);
    }

    else if(strcmp(argv[1], "pull")==0){
        pull(argc, argv);
    }

    else if(strcmp(argv[1], "push")==0){
        push(argc, argv);
    }

    else if(strcmp(argv[1], "status")==0){
        status(argc, argv);
    }

    else if(strcmp(argv[1], "tag")==0){
        tag(argc, argv);
    }

    printf(CHZ_ERROR_MSG_START"Invalid Command"MSG_END);
    return 1;
}
//gcc *.c ../include/chizel.c ../include/chzdb.c -o chz -lcrypto -lz -lpq -lcjson