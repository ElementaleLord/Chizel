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

FILE* getStagingArea(){
    FILE* staging_area = fopen(".staging_area.txt", "r");
    if(staging_area == NULL){
        printf("No files in staging area!\n");
        return NULL;
    }
    return staging_area;
}

bool clearStagingArea(){
    if(remove(".staging_are.txt")){
        printf("Cleared staging area.\n");
        return true;
    }else{
        return false;
    }
}

bool checkDup(FILE* staging_area, char* file){
    char line[256];
    rewind(staging_area);
    while(fgets(line, sizeof(line), staging_area) != NULL){
        line[strcspn(line, "\n")] = '\0';
        if(strcmp(line, file) == 0){
            return true;
        }
    }
    return false;
}

bool addFunction(char* file){
    FILE* staging_area = fopen(".staging_area.txt", "a+");
    if(staging_area == NULL){
        printf("ERROR opening staging_area.txt\n");
        return false;
    }
    if(checkDup(staging_area, file)){
        // ALREADY IN STAGING AREA
        fclose(staging_area);
        return false;
    }
    fseek(staging_area, 0, SEEK_END);
    fprintf(staging_area, "%s\n", file);
    fclose(staging_area);
    return true;
}

bool addAllFunction(){
    FILE* staging_area = fopen(".staging_area.txt", "a+");
    if(staging_area == NULL){
        printf("ERROR opening staging_area.txt\n");
        return false;
    }

    struct dirent *de;
    DIR *dr = opendir("."); // open current dir
    if(dr == NULL){
        printf("ERROR opening current directory.\n");
        return false;
    }

    while((de = readdir(dr)) != NULL){
        if(strcmp(de->d_name, ".") != 0 && strcmp(de->d_name, "..") != 0 && strcmp(de->d_name, ".staging_area.txt") != 0){
            if(!checkDup(staging_area, de->d_name)){
                fseek(staging_area, 0, SEEK_END);
                fprintf(staging_area, "%s\n", de->d_name);
            }
        }else{
            continue;
        }
    }
    fclose(staging_area);
    closedir(dr);
    return true;    
}

bool checkForFile(char *file){        
    DIR *dir = opendir(".");
    struct dirent *branchDir;
    if(dir != NULL){
        while((branchDir = readdir(dir)) != NULL){
            if(strcmp(branchDir->d_name, ".") == 0 || strcmp(branchDir->d_name, "..") == 0)
            {
                continue;
            }
            if(strcmp(branchDir->d_name, file) == 0){
                return true;    // found file
            }
        }
    }else{
        perror("getcwd error\n");
    }   // file not found or doesnt exist
    closedir(dir);
}

void add(int argc, char* argv[]){
    const char* dir = ".chz";
    const short perm = 0700;

    DIR* p_dir = opendir(dir);
    if(!p_dir){
        printf("ERROR, this isn't a .chz repository.\n");
    }
    switch(argc){
        case(ARG_BASE + 2):    // chz add
            printf("Please specifify the file to add to the staging area.\n");
            break;
        case(ARG_BASE + 3):    // chz add <xxx>
            if(strcmp(argv[ARG_BASE + 2], ".") == 0){
                if(addAllFunction()){
                    printf("Successfully added all files to staging area.\n");
                    break;
                }else{
                    printf("ERROR adding all files to staging area.\n");
                    break;
                }
            }
            if(checkForFile(argv[ARG_BASE + 2])){
                if(addFunction(argv[ARG_BASE + 2])){
                    printf("Successfully added file to staging area.\n");
                    break;
                }else{
                    printf("ERROR adding file to staging area.\n");
                    break;
                }
            }else{
                printf("File doesnt exist, make sure you input correct file name and format.\n");
                break;
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
    add(argc, argv);
    return 0;
}
