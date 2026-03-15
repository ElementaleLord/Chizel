#include <stdlib.h>
#include <stdio.h>
#include <dirent.h>
#include <errno.h>
#include <stdbool.h>
#include <string.h>
#include <sys/stat.h>

// two dots to go up a dir
#include "../include/init_template.h"

#ifdef _WIN32
#include <direct.h>
#define mkdir(dir) _mkdir(dir)
#else
#include <sys/types.h>
#endif

#define ARG_BASE -1

bool checkOrigin(DIR* p){
    
    #ifdef _WIN32
        
    #else

    #endif
}

void fetch(int argc, char* argv[]){
    const char* dir = ".chz";
    const short perm = 0700;

    DIR* p_dir = opendir(dir);
    if(!p_dir){
        printf("Not in a .chz repository, please run chz init first");
        return false;
    }
    switch(argc){
        case(ARG_BASE + 2):    // chz fetch
            if(checkOrigin(p_dir)){
                fecthFunction();
            }else{
                printf("This repository doesn't have an origin, please insert an origin via remote repository HTTPS");
                break;
            }
        case(ARG_BASE + 3):    // chz fetch <xxx>
            if(checkOrigin2()){}
    }
}

int main(int argc, char* argv[]){
    printf("argc: %i\n", argc);
    int i=0;
    while(argv[i] != NULL){
        printf("argv[%i]: %s\n",i, argv[i]);
        i++;
    }
    fetch(argc, argv);
}