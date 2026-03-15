#include <stdlib.h>
#include <stdio.h>
#include <dirent.h>
#include <errno.h>
#include <stdbool.h>
#include <string.h>
#include <sys/stat.h>

// two dots to go up a dir
#include "../include/init_template.h"
#include "../include/chz_constants.h"

#ifdef _WIN32
#include <direct.h>
#define mkdir(dir) _mkdir(dir)
#else
#include <sys/types.h>
#endif

#define ARG_BASE -1

//~ helper function self explanatory
void makeBranchesFolder(){
    #ifdef _WIN32
        if(mkdir(BRANCHES_PATH) < 0){
            printf("Failed with creating branch");
            //? P: should be replaced with something that doesnt just shut down the program
            exit(EXIT_FAILURE);
        }
    #else
        if(mkdir(BRANCHES_PATH, DEF_PERM) < 0){
            printf("Failed with creating branch");
            //? P: should be replaced with something that doesnt just shut down the program
            exit(EXIT_FAILURE);
        }
    #endif
}

//~ to add visual distinction between what directories hold what files
void printIndent(int depth){
    for(int i = 0; i < depth; i++){
        printf(" ");
    }
    for(int i = 0; i < depth; i++){
        printf("-");
    }
}

//$ O: Change to use the same system as listEverything, 
//$ O: removes the need to have separate OS-wise
void listBranches(DIR* branchDir){
    struct dirent *curDir;
    struct stat st;
    char path[1024];

    #ifdef _WIN32
        printf("Current Branches:\n");
        while((curDir = readdir(branchDir)) != NULL){
            if(strcmp(curDir->d_name, ".") != 0 && strcmp(curDir->d_name, "..") != 0){
                snprintf(path, sizeof(path), "%s/%s", BRANCHES_PATH, curDir->d_name);
                if(stat(path, &st) == 0 && S_ISDIR(st.st_mode)){
                    printf("- %s\n", curDir->d_name);
                }
            }
        }
    #else
        printf("Current Branches:\n");
        while((curDir = readdir(branchDir)) != NULL && curDir->d_type == 4){
            if(strcmp(curDir->d_name, ".") != 0 && strcmp(curDir->d_name, "..") != 0){
                printf("- %s\n", curDir->d_name);
            }
        }
    #endif
}

//~ used to recursively display dir contents
void listDirsRecursive(const char* path, int depth){
    DIR* content = opendir(path);
    struct dirent *recDir;
    struct stat st;
    char fullpath[1024];
    
    if(!content){
        printf("Error displaying content");
        //? P: should be replaced with something that doesnt just shut down the program
        exit(EXIT_FAILURE);
    }

    while((recDir = readdir(content)) != NULL){
        if(strcmp(recDir->d_name, ".") == 0 || strcmp(recDir->d_name, "..") == 0){
            continue;
        }

        snprintf(fullpath, sizeof(fullpath), "%s/%s", path, recDir->d_name);

        if(stat(fullpath, &st) == 0 && S_ISDIR(st.st_mode)){
            printIndent(depth);
            printf(" Directory: %s\n", recDir->d_name);
            listDirsRecursive(fullpath, depth + 1);
        }else{
            printIndent(depth);
            printf(" %s\n", recDir->d_name);
        }
    }
    closedir(content);
}

//~ starts recursive display of branch content
void listEverything(DIR* chzDir){
    char path[512];
    struct dirent *branchDir;
    struct stat st;//# used to diffrenciate directories from files

    printf("Current Files, Branches & Directories:\n");
    while((branchDir = readdir(chzDir)) != NULL){
        if(strcmp(branchDir->d_name, ".") == 0 || strcmp(branchDir->d_name, "..") == 0){
            continue;
        }

        snprintf(path, sizeof(path), "%s/%s", BRANCHES_PATH, branchDir->d_name);
        if(stat(path, &st) == 0 && S_ISDIR(st.st_mode)){
            printf("- Branch: %s\n", branchDir->d_name);
            listDirsRecursive(path, 2);
        }
    }
}

//! O: PROPER SAME NAME ERROR HANDLING
//? P: needs u mean ? elaborate further O:
//~ used to create a new branch with edge case handling
bool createNewBranch(char* branchName){
    //! O: LACKS BRANCH IDENTIFIERS
    //? P: possible to use the names to identify ?
    char path[1024];
    snprintf(path, sizeof(path), "%s/%s", BRANCHES_PATH, branchName);
//*-P:-do-remove-these-lines-there-only-used-to-indicate-code-i-added-------------------
    //# tentative handling of BRANCH_EXISTS_ERROR
    if (opendir(path)>= 0){
        printf("BRANCH ERROR: Branch Already Exists.");
        return false;
    }
//*-P:-do-remove-these-lines-there-only-used-to-indicate-code-i-added-------------------
    else{
        #ifdef _WIN32
        //$ P: add initialization of branch
        //$ P: not sure if possible to call commit to make an init commit for the new branch
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
}

//*-P:-do-remove-these-lines-there-only-used-to-indicate-code-i-added-------------------
void createBranch(char* branchName){
    bool success = createNewBranch(branchName);

    if(!success){
        printf("BRANCH ERROR: Failed To Create Branch %s", branchName);
        //? P: should be replaced with something that doesnt just shut down the program
        exit(EXIT_FAILURE);
    }else{
        printf("Successfully Created New Branch %s", branchName);
    }
}
//*-P:-do-remove-these-lines-there-only-used-to-indicate-code-i-added-------------------

bool branch(int argc, char* argv[]){
    DIR* p_dir = opendir(CHZ_PATH);
    if(!p_dir){
        printf("BRANCH ERROR: .chz Not Found, Plz Make Sure Your In A CHZ Repository Director Or Run: \"chz init\"");
        return false;
    }

    //? O: Change switch case to check argv[ARG_BASE + 2] instead of argc?????
    //^ P: can use argc to filter cases and make handling easier so leave as is for now
    //^ P: pending review from F:
    switch (argc){
        case (ARG_BASE + 2):
    //@ chz branch
            DIR* p_dir2 = opendir(BRANCHES_PATH);

            if(!p_dir2){
                makeBranchesFolder();
                p_dir2 = opendir(BRANCHES_PATH);
            }

            listBranches(p_dir2);

            closedir(p_dir2);
            break;
        case (ARG_BASE + 3):
    //@ chz branch <extra-arg>
        if(strcmp(argv[ARG_BASE + 2], "-a") != 0){

        //% chz branch <name>
            createBranch(argv[ARG_BASE + 2]);
        }else{
            
        //% chz branch -a 
            listEverything(p_dir);
        }
        default:
            break;
    }
    closedir(p_dir);
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