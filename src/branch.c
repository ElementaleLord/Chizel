#include <stdlib.h>
#include <stdio.h>
#include <dirent.h>
#include <errno.h>
#include <stdbool.h>
#include <string.h>
#include <sys/stat.h>
#include <cjson/cJSON.h>

//# two dots to go up a dir
#include "../include/init_template.h"
#include "../include/chz_constants.h"

#ifdef _WIN32
#include <direct.h>
#define rmdir(path) _rmdir(path)
#define mkdir(dir) _mkdir(dir)
#else
#include <unistd.h>
#include <sys/types.h>
#endif

//~ helper used to print a string representation of the current error number
void whatIsTheError(){
    printf("Error String: %s.\n", strerror(errno));
}

//~ helper function self explanatory
void makeBranchesFolder()
{
    #ifdef _WIN32
        if(mkdir(BRANCHES_PATH) < 0)
        {
            printf("BRANCH ERROR: Failed To Create Branches Directory.\n");
            whatIsTheError();
            exit(EXIT_FAILURE);
        }
    #else
        if(mkdir(BRANCHES_PATH, DEF_PERM) < 0)
        {
            printf("BRANCH ERROR: Failed To Create Branches Directory.\n");
            whatIsTheError();
            exit(EXIT_FAILURE);
        }
    #endif
}

//~ to add visual distinction between what directories hold what files
void printIndent(int depth)
{
    for(int i = 0; i < depth; i++) printf(" ");
    for(int i = 0; i < depth; i++) printf("-");
}

//~ used to list all branch names
void listBranches(DIR* branchDir)
{
    struct dirent *curDir;
    struct stat st;
    char path[1024];

    printf("Current Branches:\n");
    while((curDir = readdir(branchDir)) != NULL)
    {
        if(strcmp(curDir->d_name, ".") != 0 && strcmp(curDir->d_name, "..") != 0)
        {
            snprintf(path, sizeof(path), "%s/%s", BRANCHES_PATH, curDir->d_name);
            if(stat(path, &st) == 0 && S_ISDIR(st.st_mode))
            {
                printf("- %s\n", curDir->d_name);
            }
        }
    }
}

//~ used to recursively display dir contents
void listDirsRecursive(const char* path, int depth)
{
    DIR* content = opendir(path);
    struct dirent *recDir;
    struct stat st;
    char fullpath[1024];
    
    if(!content)
    {
        printf("BRANCH ERROR: Failed To Open Directory %s.\n", path);
        whatIsTheError();
        exit(EXIT_FAILURE);//? P: potentially replace with return instead
    }

    while((recDir = readdir(content)) != NULL)
    {
        if(strcmp(recDir->d_name, ".") == 0 || strcmp(recDir->d_name, "..") == 0)
        {
            continue;
        }

        snprintf(fullpath, sizeof(fullpath), "%s/%s", path, recDir->d_name);

        if(stat(fullpath, &st) == 0 && S_ISDIR(st.st_mode))
        {
            printIndent(depth);
            printf(" Directory: %s\n", recDir->d_name);
            listDirsRecursive(fullpath, depth + 1);
        }else
        {
            printIndent(depth);
            printf(" %s\n", recDir->d_name);
        }
    }
    closedir(content);
}

//~ starts recursive display of branch content
void listEverything(DIR* chzDir)
{
    char path[512];
    struct dirent *branchDir;
    struct stat st;         //# used to differenciate directories from files

    printf("Current Files, Branches & Directories:\n");
    while((branchDir = readdir(chzDir)) != NULL)
    {
        if(strcmp(branchDir->d_name, ".") == 0 || strcmp(branchDir->d_name, "..") == 0)
        {
            continue;
        }

        snprintf(path, sizeof(path), "%s/%s", BRANCHES_PATH, branchDir->d_name);
        if(stat(path, &st) == 0 && S_ISDIR(st.st_mode))
        {
            printf("- Branch: %s\n", branchDir->d_name);
            listDirsRecursive(path, 2);
        }
    }
}

//~ used to create a new branch with edge case handling
bool createNewBranch(char* branchName)
{
    //! O: LACKS BRANCH IDENTIFIERS
    //^ P: will be resolved by a config json for each branch file
    char path[1024];
    DIR* existingDir;
    
    snprintf(path, sizeof(path), "%s/%s", BRANCHES_PATH, branchName);

    existingDir = opendir(path);
    if(existingDir != NULL)
    {
        closedir(existingDir);
        printf("BRANCH REPORT: Branch Already Exists.\n");
        return false;
    }
    else
    {
        #ifdef _WIN32
        //$ P: add initialization of branch
        //$ P: use json to create a template config and add to branch dir
        //$ P: not sure if possible to call commit to make an init commit for the new branch
            if(mkdir(path) < 0)
            {
                return false;
            }
            else{
                //# create json object
                cJSON* json= cJSON_CreateObject();
                char confPath[1024];

                //# add json key value pairs
                cJSON_AddStringToObject(json, "name", branchName);
                cJSON_AddStringToObject(json, "path", path);

                //# convert json object to json string
                char* jsonStr= cJSON_Print(json);

                //# get proper path to config
                snprintf(confPath, sizeof(confPath), "%s/%s", path, "config.json");
                printf("%s\n",confPath);

                //# open file in write and error handle
                FILE* p_config= fopen(confPath, "w");
                if (p_config == 0){
                    printf("BRANCH ERROR: Failed To Create Config For Branch %s.\n", path);
                    whatIsTheError();
                    return false;
                }
                
                //# write to file
                fputs(jsonStr, p_config);

                //# self expanatory but might need to be done in order?
                fclose(p_config);
                cJSON_free(jsonStr);
                cJSON_Delete(json);
            }
        #else
            if(mkdir(path, 0700) < 0)
            {
                return false;
            }
            else{

            }
        #endif
        return true;
    }
}

void createBranch(char* branchName)
{
    bool success = createNewBranch(branchName);
    if(!success)
    {
        printf("BRANCH ERROR: Failed To Create Branch %s.\n", branchName);
        whatIsTheError();
        exit(EXIT_FAILURE);//? P: potentially replace with return instead
    }else
    {
        printf("BRANCH REPORT: Successfully Created New Branch %s.\n", branchName);
    }
}

//~ used to soft-delete any empty branch
void deleteBranch(const char* path)
{
    struct dirent *curDir;
    struct stat st;
    char confPath[1024];
    bool empty = true;
    DIR* branch = opendir(path);

    if(!branch) return;

    while((curDir = readdir(branch)) != NULL)
    {
        if(strcmp(curDir->d_name, ".") != 0 && strcmp(curDir->d_name, "..") != 0 && strcmp(curDir->d_name, "config.json") != 0)
        {
            empty = false;
        }
    }

    closedir(branch);

    if(!empty)
    {
        printf("BRANCH REPORT: Branch non-empty, operation aborted.\n");
        printf("BRANCH REPORT: chz branch -D to forcefully delete branch.\n");
    }else
    {
        snprintf(confPath, sizeof(confPath), "%s/%s", path, "config.json");
        
        if (remove(confPath) != 0){
            printf("BRANCH ERROR: Failed To Delete Config Of Branch %s.\n", path);
            whatIsTheError();
            return;
        }

        if(rmdir(path) < 0)
        {
            printf("BRANCH ERROR: Failed To Delete Branch %s.\n", path);
            whatIsTheError();
        }
        else
        {
            printf("BRANCH REPORT: Deletion successful.\n");
        }
    }
}

//~ used to hard delete a branch
void forceDelete(const char* path)
{
    struct dirent *dir;
    struct stat st;
    char fullpath[512];
    DIR* branch = opendir(path);
 
    if(!branch) return;
 
    while((dir = readdir(branch)) != NULL)
    {
        if(strcmp(dir->d_name, ".") == 0 || strcmp(dir->d_name, "..") == 0) 
        {
            continue;
        }
        
        snprintf(fullpath, sizeof(fullpath), "%s/%s", path, dir->d_name);

        if(stat(fullpath, &st) == 0 && S_ISDIR(st.st_mode))
        {
            forceDelete(fullpath);
        }else{ 
            remove(fullpath);
        }
    }

    closedir(branch);
    if(rmdir(path) < 0)
    {
        printf("BRANCH ERROR: Failed To Delete Branch %s.\n", path);
        whatIsTheError();
    }
    else{
        printf("BRANCH REPORT: Sucessful Force Delete of Branch %s.\n", path);
    }
}

//~ helper used to handle preliminary steps before calling forceDelete()
void preForceDelete(char* path){
    char confirmation;            

    printf("BRANCH REPORT: Force Deleting A Branch Erases All Data Contained Inside, ");
    
    do
    {
        printf("Proceed? [Y/N]: ");
        scanf(" %c", &confirmation);
    }while(confirmation != 'y' && confirmation != 'Y' && confirmation != 'n' && confirmation != 'N');

    if(confirmation == 'y' || confirmation == 'Y') forceDelete(path);
    else printf("BRANCH REPORT: Force Delete Aborted Successfully");
}

//~ helper used to handle preliminary steps before renaming a branch
void preRename(char* path, char* oldName, char* newName){
    char newPath[1024];
    DIR *oldDir = opendir(path), *newDir;
                
    if(!oldDir)
    {
        printf("BRANCH ERROR: Branch %s Not Found.\n", oldName);
        whatIsTheError();
        exit(EXIT_FAILURE);//? P: potentially replace with return instead
    }
                  
    snprintf(newPath, sizeof(newPath), "%s/%s", BRANCHES_PATH, newName);
    newDir = opendir(newPath);

    if(newDir){
        printf("BRANCH REPORT: Branch %s already exists.\n", newName);
        return;
    }
                
    if(rename(path, newPath) == 0) printf("BRANCH REPORT: Branch Renamed Successfully.\n");
    else
    {
        printf("BRANCH ERROR: Failed To Rename Branch %s to %s.\n", path, newPath);
        whatIsTheError();
    }
}

//~ helper used to handle preliminary steps before calling listBranches()
void preListBranches(){
    DIR* p_dir2 = opendir(BRANCHES_PATH);
    
    if(!p_dir2)
    {
        makeBranchesFolder();
        p_dir2 = opendir(BRANCHES_PATH);
    }

    listBranches(p_dir2);
    closedir(p_dir2);
}

//~ main runner function used to determine case and call appropriate function
bool branch(int argc, char* argv[])
{
    char path[1024];
    DIR* p_dir = opendir(CHZ_PATH);
    
    if(!p_dir)
    {
        printf("BRANCH ERROR: .chz Not Found, Plz Make Sure Your In A CHZ Repository Director Or Run: \"chz init\"");
        return false;
    }
    
    switch(argc)
    {
        //@ chz branch
        case (ARG_BASE + 2):
            preListBranches();
            break;

        //@ chz branch <arg>
        case (ARG_BASE + 3):
            if(strcmp(argv[ARG_BASE + 2], "-a") == 0)
            {//% chz branch -a
                listEverything(opendir(BRANCHES_PATH));
            }
            else
            {//% chz branch <name>
                createBranch(argv[ARG_BASE + 2]);
            }
            break;

        //@ chz branch <arg> <arg>
        case (ARG_BASE + 4):
            if(strcmp(argv[ARG_BASE + 2], "-d") == 0)
            {//% chz branch -d <branch>
                snprintf(path, sizeof(path), "%s/%s", BRANCHES_PATH, argv[ARG_BASE + 3]);
                deleteBranch(path);
            }
            else if(strcmp(argv[ARG_BASE + 2], "-D") == 0)
            {//% chz branch -D <branch>
                snprintf(path, sizeof(path), "%s/%s", BRANCHES_PATH, argv[ARG_BASE + 3]);
                preForceDelete(path);
            }
            break;

        //@ chz branch <arg> <arg> <arg>
        case (ARG_BASE + 5):
            if(strcmp(argv[ARG_BASE + 2], "-m") == 0)
            {//% chz branch -m <oldName> <newName>
                snprintf(path, sizeof(path), "%s/%s", BRANCHES_PATH, argv[ARG_BASE + 3]);
                preRename(path, argv[ARG_BASE + 3], argv[ARG_BASE + 4]);
            }
            break;
        default:
            break;
    }
    closedir(p_dir);
}

int main(int argc, char* argv[])
{
    branch(argc, argv);
}
