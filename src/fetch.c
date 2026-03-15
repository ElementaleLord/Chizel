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
    FILE *file = fopen("origin.txt","r");
    if(file == NULL){
        fprintf("Repository doesn't have an origin.");
        return false;
    }
    return true;  
}

bool checkOrigin2(DIR* p,char* originCheck){
    FILE *file = fopen("origin.txt","w");
    if(file == NULL){
        fprintf("ERROR CREATING ORIGIN FILE");
        return false;
    }
    char origin[256];
    fscanf(file, "%s", origin);
    fclose(file);
    if(strcmp(origin,originCheck) == 0){
        return true;
    }else{
        fprintf("Repository already has the origin: ", origin);
        fprintf("\nCannot overwrite default origin.")
        return false;
    }
}

void fetchFromChizel(char* link){}

void fetchFunction(char* link){
    char* p = strstr(link,"CHIZEL LINK");
    if(p == link){
        fetchFromChizzel(link);
    }else{
        fprintf("Invalid link, make sure repository is from Github or Chizel.");
    }
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
                FILE *file = fopen("origin.txt","r");
                if(file == NULL){
                    fprintf("ERROR OPENING ORIGIN FILE");
                }
                char origin[256];
                fscanf(file, "%s", origin);
                fecthFunction(origin);
                fclose(file);
            }else{
                printf("This repository doesn't have an origin, please insert an origin via remote repository HTTPS");
                break;
            }
        case(ARG_BASE + 3):    // chz fetch <xxx>
            if(checkOrigin2(p_dir, argv[2])){
                fetchFunction(argv[2]);
            }
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