#include "../include/chz.h"

int main(int argc, char *argv[]) {
    if(argc < 2) {
        printf("Usage: chz <command>\n");
        return 1;
    }

    int r = 0;

    if(strcmp(argv[1], "init") == 0){
        init(argc, argv);
        r=1;
    }

    else if(strcmp(argv[1], "add") == 0){
        add(argc, argv);
        r=1;
    }

    else if(strcmp(argv[1], "branch") == 0){
        branch(argc, argv);
        r=1;
    }

    else if(strcmp(argv[1], "checkout") == 0){
        checkout(argc, argv);
        r=1;
    }

    else if(strcmp(argv[1], "clone") == 0){
        clone(argc, argv);
        r=1;
    }

    else if(strcmp(argv[1], "commit") == 0){
        commit(argc, argv);
        r=1;
    }

    else if(strcmp(argv[1], "clone")==0){
        clone(argc, argv);
        r=1;
    }

    else if(strcmp(argv[1], "fetch") == 0){
        return fetch(argc, argv);
        r=1;
    }

    else if(strcmp(argv[1], "log") == 0){
        logs(argc, argv);
        r=1;
    }

    else if(strcmp(argv[1], "merge") == 0){
        merge(argc, argv);
        r=1;
    }

    else if(strcmp(argv[1], "pull") == 0){
        pull(argc, argv);
        r=1;
    }

    else if(strcmp(argv[1], "push") == 0){
        push(argc, argv);
        r=1;
    }

    else if(strcmp(argv[1], "status") == 0){
        status(argc, argv);
        r=1;
    }

    else if(strcmp(argv[1], "tag") == 0){
        tag(argc, argv);
        r=1;
    }

    if(r==0)
        printf(CHZ_ERROR_MSG_START"Invalid Command"MSG_END);
    return 1;
}

/*
gcc *.c ../include/chizel.c ../include/chzdb.c -o chz -lcrypto -lz -lpq
*/