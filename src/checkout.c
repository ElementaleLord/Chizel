#include <dirent.h>
#include "../include/chizel.c"

#ifdef _WIN32
#include <direct.h>
#define rmdir(path) _rmdir(path)
#define mkdir(dir) _mkdir(dir)
#endif

//~ helper used to create a branch with given branchName
void callBranch(char* branchName)
{//# calls branch.c with given branch name

}

//~ helper returning true if any file is modified since latest commit to current branch
bool checkForChanges()
{//# check if theres modified files in current branch
    return false;
}

void loadData(char* path_to_commit)
{//# delete current repo files (excluding .chz) then uncompresses commits data and writes it to the repo

}

//~ helper that finds the path to the head commit of a given branch then calls loadData()
void findBranchHeadCommit(char* branchName)
{//# validates the branch exists and return the path to the branches head commit
    char* headCommit;

    loadData(headCommit);
}


//~ function used as interface to call needed functions
void preCheckout(char* branchName)
{
    if (checkChz())
    {
        if (!checkForChanges())
        {
            findBranchHeadCommit(branchName);
        }
        else
        {
            printf(CHECKOUT_ERROR_MSG_START"Make Sure To Commit All Changes Before Using chz checkout %s"MSG_END, branchName);
            whatIsTheError();
            printf(CHECKOUT_REPORT_MSG_START"Hint: use chz commit"MSG_END);
        }

    }
}

//~ helper used to display help menu
void checkoutHelp()
{
    printf(CHECKOUT_REPORT_MSG_START"Usage: chz status | chz status -h."MSG_END);
}

void checkout(int argc, char* argv[])
{
    switch(argc)
    {
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
                if (checkChz())
                {
                    preCheckout(argv[ARG_BASE + 3]);
                }
            }
            break;
        //@ chz checkout <arg> <arg>
        case ARG_BASE + 4:
            if(strcmp(argv[ARG_BASE + 2], "-b") == 0)
            {//% chz checkout -b <branch-name>
                if (checkChz())
                {
                    callBranch(argv[ARG_BASE + 4]);
                    preCheckout(argv[ARG_BASE + 4]);
                }
            }
            break;
        default:
            printf(CHZ_ERROR_MSG_START"Invalid Command"MSG_END);
            break;
    }
}

int main(int argc, char* argv[])
{
    checkout(argc, argv);
    return 0;
}