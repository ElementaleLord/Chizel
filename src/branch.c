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
#define rmdir(path) _rmdir(path)
#define mkdir(dir) _mkdir(dir)
#else
#include <unistd.h>
#include <sys/types.h>
#endif

#define ARG_BASE -1

//$ Find a better replacement/error

//~ helper function self explanatory
void makeBranchesFolder()
{
    #ifdef _WIN32
        if(mkdir(BRANCHES_PATH) < 0)
        {
            printf("Failed with creating branch");
            exit(EXIT_FAILURE);
        }
    #else
        if(mkdir(BRANCHES_PATH, DEF_PERM) < 0)
        {
            printf("Failed with creating branch");
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
        printf("Error displaying content");
        exit(EXIT_FAILURE);
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
    //? P: possible to use the names to identify ?
    //^ O: i was thinking some more formal identific
    char path[1024];
    DIR* existingDir;
    snprintf(path, sizeof(path), "%s/%s", BRANCHES_PATH, branchName);

    existingDir = opendir(path);
    if(existingDir != NULL)
    {
        closedir(existingDir);
        printf("BRANCH ERROR: Branch Already Exists.\n");
        return false;
    }
    else
    {
        #ifdef _WIN32
        //$ P: add initialization of branch
        //$ P: not sure if possible to call commit to make an init commit for the new branch
            if(mkdir(path) < 0)
            {
                return false;
            }
        #else
            if(mkdir(path, 0700) < 0)
            {
                return false;
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
        printf("BRANCH ERROR: Failed To Create Branch %s", branchName);
        exit(EXIT_FAILURE);
    }else
    {
        printf("Successfully Created New Branch %s", branchName);
    }
}

void deleteBranch(const char* path)
{
    DIR* branch = opendir(path);
    struct dirent *curDir;
    struct stat st;
    bool empty = true;

    if(!branch) return;

    while((curDir = readdir(branch)) != NULL)
    {
        if(strcmp(curDir->d_name, ".") != 0 && strcmp(curDir->d_name, "..") != 0)
        {
            empty = false;
        }
    }

    closedir(branch);

    if(!empty)
    {
        printf("BRANCH DELETE: Branch non-empty, operation aborted.\n");
        printf("BRANCH DELETE: chz branch -D to forcefully delete branch");
    }else
    {
        if(rmdir(path) < 0)
        {
            printf("BRANCH DELETE: Failure whilst deleting branch");
        }
        else
        {
            printf("BRANCH DELETE: Deletion successful");
        }
    }
    
}

void forceDelete(const char* path)
{
    DIR* branch = opendir(path);
    if(!branch) return;

    struct dirent *dir;
    struct stat st;
    char fullpath[512];

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
    rmdir(path);
}

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
        case (ARG_BASE + 2):        //@ chz branch
            DIR* p_dir2 = opendir(BRANCHES_PATH);

            if(!p_dir2)
            {
                makeBranchesFolder();
                p_dir2 = opendir(BRANCHES_PATH);
            }

            listBranches(p_dir2);

            closedir(p_dir2);
            break;

        case (ARG_BASE + 3):
            if(strcmp(argv[ARG_BASE + 2], "-a") == 0)       //% chz branch -a
            {
                listEverything(opendir(BRANCHES_PATH));
            }
            else                                        //% chz branch <name> 
            {
                createBranch(argv[ARG_BASE + 2]);
            }
            break;

        case (ARG_BASE + 4):
            snprintf(path, sizeof(path), "%s/%s", BRANCHES_PATH, argv[ARG_BASE + 3]);

            if(strcmp(argv[ARG_BASE + 2], "-d") == 0)       //% chz branch -d <branch>
            {
                deleteBranch(path);
            }
            else if(strcmp(argv[ARG_BASE + 2], "-D") == 0)       //% chz branch -D <branch>
            {
                char confirmation;
                printf("Deleting the branch forcefully will erase all data contained inside, proceed? [y/N]: ");
                do
                {
                   scanf("%s", &confirmation);
                }while(confirmation != 'y' && confirmation != 'N');
                if(confirmation == 'y') forceDelete(path);
                else printf("Force Deletion Aborted Successfully");
            }
            break;

        case (ARG_BASE + 5):        //% chz branch -m <oldName> <newName>
            if(strcmp(argv[ARG_BASE + 2], "-m") == 0)
            {
                snprintf(path, sizeof(path), "%s/%s", BRANCHES_PATH, argv[ARG_BASE + 3]);
                DIR* oldDir = opendir(path);
                if(!oldDir){
                    printf("BRANCH RENAME: Branch %s not found", argv[ARG_BASE + 3]);
                    exit(EXIT_FAILURE);
                }
                char newName[1024];
                snprintf(newName, sizeof(newName), "%s/%s", BRANCHES_PATH, argv[ARG_BASE + 4]);

                DIR* newDir = opendir(newName);
                if(newDir){
                    printf("BRANCH RENAME: Branch %s already exists", argv[ARG_BASE + 4]);
                    exit(EXIT_FAILURE);
                }
                if(rename(path, newName) == 0) printf("Branch renamed successfully");
                else
                {
                    perror("BRANCH RENAME: Error renaming directory");
                    printf("Error code: %d", errno);
                }
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
