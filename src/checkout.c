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
void whatIsTheError()
{
    printf("Error String: %s.\n", strerror(errno));
}

//~ helper used to check if .chz exists
bool checkChz()
{
    DIR* p_dir = opendir(CHZ_PATH);
    
    if(!p_dir)
    {
        printf("STATUS ERROR: .chz Directory Does Not Exists.\n");
        whatIsTheError();
        return false;
    }
    
    closedir(p_dir);
    return true;
}

//~ helper used to create a branch to checkout to
void callBranch(char* branchName)
{
    //# calls branch.c with given branch name
}

//~ helper returning true if any file is modified since latest commit to current branch
bool checkChanges()
{
    //# check if theres modified files in current branch
    return false;
}

//~ helper returning the path to the head commit of given branch
char* getGivenBranchHeadCommit(char* branchName)
{
    //# validates the branch exists and return the path to the branches head commit
    return "";
}

void loadData(char* path_to_commit)
{
    //# delete current repo files (excluding .chz) then uncompresses commits data and writes it to the repo
}


//~ function used as interface to call needed functions
void doCheckout(char* branchName)
{
    if (checkChz())
    {
        if (checkChanges())
        {
            char* headCommit= getGivenBranchHeadCommit(branchName);
            loadData(headCommit);
        }
        else
        {
            printf("CHECKOUT ERROR: Make Sure To Commit All Changes Before Using chz checkout %s, hint: use chz commit.\n", branchName);
        }

    }
}

//~ helper used to display help menu
void checkoutHelp(){
    printf("CHECKOUT REPORT:\nUsage: chz status, chz status -h.\n");
}

void checkout(int argc, char* argv[])
{
    char path[1024];
    DIR* p_dir;
    
    switch(argc){
        //@ chz checkout
        case ARG_BASE + 2:
            break;
        //@ chz checkout <arg>
        case ARG_BASE + 3:
            if(strcmp(argv[ARG_BASE + 2], "-h") == 0)
            {//% chz checkout -h
                checkoutHelp();
            }
            else
            {//% chz checkout <branch-name>
                doCheckout(argv[ARG_BASE + 3]);
            }
            break;
        //@ chz checkout <arg> <arg>
        case ARG_BASE + 4:
            if(strcmp(argv[ARG_BASE + 2], "-b") == 0)
            {//% chz checkout -b <branch-name>
                callBranch(argv[ARG_BASE + 4]);
                doCheckout(argv[ARG_BASE + 4]);
            }
            break;
        default:
            break;
    }
    close(p_dir);
}

int main(int argc, char* argv[])
{
    checkout(argc, argv);

    return 0;
}