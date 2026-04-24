#include "../include/chizel.h"
#include "../include/chzdb.h"
#include "fetch.c"

void pullHelp(){
    printf(PULL_REPORT_MSG_START"\nUsage: chz pull | chz pull -h"MSG_END);
}

void pull(int argc, char* argv[]){

    switch(argc){
        //@ chz pull
        case ARG_BASE + 2:
            if(!fetch(argc, argv)){
                return;
            }
            
            //& O: this is the worst possible outcome, but i cant do anything else as far as my brainpower goes
            int r = restorePack(".chz/objects/restored/pulled.pack", ".");
            if(r < 0){
                printf(PULL_ERROR_MSG_START"Could not unpack restored content"MSG_END);
                return;
            }
            
            break;

        //@ chz pull <arg>
        case ARG_BASE + 3:
            //% chz pull -h
            if(strcmp(argv[ARG_BASE + 2], "-h") == 0){
                pullHelp();
            }
            else{
                //% chz pull <url>
                if(!fetch(argc, argv)){
                    return;
                }

                int r = restorePack(".chz/objects/restored/pulled.pack", ".");
                if(r < 0){
                    printf(PULL_ERROR_MSG_START"Could not unpack restored content"MSG_END);
                    return;
                }
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