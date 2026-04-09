#include "../include/chizel.h"
#include "../include/chzdb.h"
#include "fetch.c"
#include "merge.c"

void pullHelp(){
    printf(PULL_REPORT_MSG_START"\nUsage: chz pull | chz pull -h"MSG_END);
}

void pull(int argc, char* argv[]){
    
    PGresult* data;

    switch(argc){
        //@ chz pull
        case ARG_BASE + 2:
            data = fetch(argc, argv);
            if(data == NULL){
                return;
            }
            merge(argc, argv);
            break;

        //@ chz pull <arg>
        case ARG_BASE + 3:
            //% chz pull -h
            if(strcmp(argv[ARG_BASE + 2], "-h") == 0){
                pullHelp();
            }
            else{
                //% chz pull <url>
                data = fetch(argc, argv);
                if(data == NULL){
                    return;
                }
                merge(argc, argv); // + data
                break;
            }
            break;

        default:
            printf(CHZ_ERROR_MSG_START"Invalid Command"MSG_END);
            break;
    }
}

int main(int argc, char* argv[]){
    pull(argc, argv);
}