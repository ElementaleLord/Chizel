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
/* ARG_BASE used for argc & argv equalisation, since right now we're not using the full command "chz branch", but rather
"./branch" or "./branch.exe", the argument count is less than if we'd use it later on. Whilst working without "chz" keep it -1,
otherwise change to 0
bilo wrote something entirely different, he's so fucking useless. (hello!👋🐱) */

void makeBrancheFolder(){
    const char* path = ".chz/branches";
    #ifdef _WIN32
        if(mkdir(path) < 0){
            printf("Failed with creating branch");
            exit(EXIT_FAILURE);
        }
    #else
        if(mkdir(path, 0700) < 0){
            printf("Failed with creating branch");
            exit(EXIT_FAILURE);
        }
    #endif
}

void printIndent(int depth){
    for(int i = 0; i < depth; i++){
        printf(" ");
    }
    for(int i = 0; i < depth; i++){
        printf("-");
    }
}

//$ TO-DO: Change to use the same system as listEverything, removes the need to have separate OS-wise
void listBranches(DIR* p){
    #ifdef _WIN32
        p = opendir(".chz/branches");
        struct dirent *de;
        struct stat st;
        char path[1024]; 
        printf("Current Branches:\n");
        while((de = readdir(p)) != NULL){
            if(strcmp(de->d_name, ".") != 0 && strcmp(de->d_name, "..") != 0){
                snprintf(path, sizeof(path), ".chz/branches/%s", de->d_name);
                if(stat(path, &st) == 0 && S_ISDIR(st.st_mode)){
                    printf("- %s\n", de->d_name);
                }
            }
        }
    #else
        p = opendir(".chz/branches");
        struct dirent *de;
        printf("Current Branches:\n");
        while((de = readdir(p)) != NULL && de->d_type == 4){
            if(strcmp(de->d_name, ".") != 0 && strcmp(de->d_name, "..") != 0){
                printf("- %s\n", de->d_name);
            }
        }
    #endif
}

void listDirsRecursive(const char* path, int depth){
    DIR* content = opendir(path);
    struct dirent *dc;
    struct stat st;
    char fullpath[1024];
    
    if(!content){
        printf("Error displaying content");
        exit(EXIT_FAILURE);
    }

    while((dc = readdir(content)) != NULL){
        if(strcmp(dc->d_name, ".") == 0 || strcmp(dc->d_name, "..") == 0){
            continue;
        }

        snprintf(fullpath, sizeof(fullpath), "%s/%s", path, dc->d_name);

        if(stat(fullpath, &st) == 0 && S_ISDIR(st.st_mode)){
            printIndent(depth);
            printf(" Directory: %s\n", dc->d_name);
            listDirsRecursive(fullpath, depth + 1);
        }else{
            printIndent(depth);
            printf(" %s\n", dc->d_name);
        }
    }
    closedir(content);
}

void listEverything(DIR* p){
    p = opendir(".chz/branches");
    char path[512];
    struct dirent *de;
    struct stat st;
    printf("Current Files, Branches & Directories:\n");
    while((de = readdir(p)) != NULL){
        if(strcmp(de->d_name, ".") == 0 || strcmp(de->d_name, "..") == 0){
            continue;
        }

        snprintf(path, sizeof(path), ".chz/branches/%s", de->d_name);
        if(stat(path, &st) == 0 && S_ISDIR(st.st_mode)){
            printf("- Branch: %s\n", de->d_name);
            listDirsRecursive(path, 2);
        }
    }
}

//! PROPER SAME NAME ERROR HANDLING
bool createNewBranch(char* name){       //! LACKS BRANCH IDENTIFIERS
    char path[1024];
    snprintf(path, sizeof(path), ".chz/branches/%s", name);
    #ifdef _WIN32
        if(mkdir(path) < 0){
            return false;
        }
    #else
        if(mkdir(path, 0700) < 0){
            return false;
        }
    #endif
    return true;
}

//? Change switch case to check argv[ARG_BASE + 2] instead of argc?????
bool branch(int argc, char* argv[]){
    const char* dir = ".chz";
    const short perm = 0700;

    DIR* p_dir = opendir(dir);
    if(!p_dir){
        printf("Not in a .chz repository, please run chz init first");
        return false;
    }
    switch (argc){
    case (ARG_BASE + 2):             // chz branch
        DIR* p_dir2 = opendir(".chz/branches");
        if(!p_dir2){
            makeBrancheFolder();
        }
        listBranches(p_dir);
        break;

    case (ARG_BASE + 3):
        if(strcmp(argv[ARG_BASE + 2], "-a") != 0){        // chz branch <name>
            bool success = createNewBranch(argv[ARG_BASE + 2]);
            if(!success){
                printf("Error creating new branch %s", argv[ARG_BASE + 2]);
                exit(EXIT_FAILURE);
            }else{
                printf("Successfully created new branch %s", argv[ARG_BASE + 2]);
            }
        }else{      //chz branch -a
            listEverything(p_dir);
        }
    
    default:
        break;
    }
}

int main(int argc, char* argv[]){
    printf("argc: %i\n", argc);
    int i=0;
    while(argv[i] != NULL){
        printf("argv[%i]: %s\n",i, argv[i]);
        i++;
    }
    branch(argc, argv);
}