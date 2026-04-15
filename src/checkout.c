#include <dirent.h>
#include "../include/chizel.h"
#include <sys/stat.h>
#include <fcntl.h>

#ifdef _WIN32
#include <direct.h>
#define rmdir(path) _rmdir(path)
#define mkdir(dir) _mkdir(dir)
#endif

//* P: taken from checkout.c in chz-checkout could be added to the header
time_t getHeadCommitTime(){
    char path[1024], headPath[1024], commitPath[1024], fullPath[1024];
    struct dirent *file;
    struct stat st;

    FILE* head_ptr = fopen(HEAD_PATH, "r");
    if (!head_ptr)
    {
        printf(STATUS_ERROR_MSG_START"Failed To Open HEAD File"MSG_END);
        // whatIsTheError();
        //! P: make sure to add to header a prototype for whatIsTheError()
        return -1;
    }
    if (!fgets(headPath, 1024, head_ptr))
    {
        printf(STATUS_ERROR_MSG_START"Failed To Read HEAD File"MSG_END);
        // whatIsTheError();
        return -1;
    }
    fclose(head_ptr);

    // headPath[strlen(headPath)-1] = '\0';//# used to remove the \n from the line

    sprintf(path, CHZ_PATH"/%s", headPath);

    printf("head= %s\n", headPath);
    printf("path= %s\n", path);
    
    FILE* branch_ptr = fopen(path, "r");
    if (!branch_ptr)
    {
        printf(STATUS_ERROR_MSG_START"Failed To Open Branch File"MSG_END);
        // whatIsTheError();
        return -1;
    }
    if (!fgets(path, 1024, branch_ptr))
    {
        printf(STATUS_ERROR_MSG_START"Failed To Read Branch File"MSG_END);
        // whatIsTheError();
        return -1;
    }
    fclose(branch_ptr);

    sprintf(commitPath, OBJECTS_PATH"/%c%c",path[0], path[1]);

    printf("id= %s\n", path);
    printf("commit= %s\n", commitPath);

    DIR* commit_ptr = opendir(commitPath);
    if (!commit_ptr)
    {
        printf(STATUS_ERROR_MSG_START"Failed To Open Commit File"MSG_END);
        // whatIsTheError();
        return 0;
    }

    while((file = readdir(commit_ptr)) != NULL)
    {
        if(strcmp(file->d_name, ".") == 0 || strcmp(file->d_name, "..") == 0) continue;
        
        snprintf(fullPath, sizeof(fullPath), "%s/%s", commitPath, file->d_name);
        printf("fullPath= %s\n", fullPath);
        
        stat(fullPath, &st);
    }
    closedir(commit_ptr);
    return st.st_mtime;
}
//* P: taken from checkout.c in chz-checkout  could be added to the header

//~ helper used to create a branch with given branchName
void callBranch(char* branchName)
{//# calls branch.c with given branch name

}

//~ helper used to check if the given branch exists
bool checkBranch(char* branchName)
{
    char path[1024];
    sprintf(path, REFS_HEADS_PATH"/%s", branchName);
    // printf("exists= %s\n", path);

    FILE* branch_ptr = fopen(path, "r");
    if (branch_ptr){
        fclose(branch_ptr);
        return true;
    }
    else{
        return false;
    }
}

//~ helper used to check if the given branch is the same as current branch
bool checkCurBranch(char* branchName)
{
    char curBranchPath[1024], path[1024], givenBranchPath[1024];

    FILE* head_ptr = fopen(HEAD_PATH, "r");
    if (!head_ptr)
    {
        printf(STATUS_ERROR_MSG_START"Failed To Open HEAD File To Get Path"MSG_END);
        // whatIsTheError();
        //! P: make sure to add to header a prototype for whatIsTheError()
        return true;
    }
    if (!fgets(path, 1024, head_ptr))
    {
        printf(STATUS_ERROR_MSG_START"Failed To Read Path From HEAD File"MSG_END);
        // whatIsTheError();
        return true;
    }
    fclose(head_ptr);

    sprintf(curBranchPath, CHZ_PATH"/%s", path);
    sprintf(givenBranchPath, REFS_HEADS_PATH"/%s", branchName);

    printf("cur= %s\n", curBranchPath);
    printf("giv= %s\n", givenBranchPath);

    if (strcmp(curBranchPath, givenBranchPath) == 0) return true;
    else return false;

}

//~ helper returning true if any file is modified since latest commit to current branch
bool checkForChanges()
{//# check if theres modified files by comparing the mtime of the head commit in current branch with the current repo files mtime
    time_t commitTime = getHeadCommitTime();

    char cwd[512];          // current working directory
    getcwd(cwd, sizeof(cwd));
    DIR* repo_ptr = opendir(cwd);
    if (!repo_ptr)
    {
        printf(STATUS_ERROR_MSG_START"Failed To Open Repo Directory"MSG_END);
        // whatIsTheError();
        return 0;
    }
    struct dirent *path;
    char fullpath[1024];
    struct stat st;

    while((path = readdir(repo_ptr)) != NULL)
    {
        if(strcmp(path->d_name, ".") == 0 || strcmp(path->d_name, "..") == 0 || strcmp(path->d_name, CHZ_PATH) == 0) continue;
        
        snprintf(fullpath, sizeof(fullpath), "%s/%s", repo_ptr, path->d_name);

        //# compare the fullpath with .chzignore here somehow
        stat(fullpath, &st);

        if (difftime(st.st_mtime, commitTime) > 0){
            return true;
        }
    }
    return false;
}

//~ function used to delete the current repo and load the current branch data
void loadData()
{//# delete current repo files (excluding .chz)

    //#then uncompresses the data of the current branch head commit and write that data to the repo dir

}

//~ function used to overwrite HEAD with the given branch path to make it the Current Branch
void alterHEAD(char* branchName)
{
    char path[1024];

    FILE* head_ptr = fopen(HEAD_PATH, "w");
    if (!head_ptr)
    {
        printf(STATUS_ERROR_MSG_START"Failed To Open HEAD File To Alter Path"MSG_END);
        // whatIsTheError();
        //! P: make sure to add to header a prototype for whatIsTheError()
        return;
    }
    sprintf(path, "refs/heads/%s",branchName);

    if (!fputs(path, head_ptr))
    {
        printf(STATUS_ERROR_MSG_START"Failed To Write To HEAD File"MSG_END);
        // whatIsTheError();
        return;
    }
    fclose(head_ptr);
    loadData();
}

//~ function used as interface to call needed functions
void preCheckout(char* branchName)
{
    if (checkChz())
        if (checkBranch(branchName))
            if (!checkCurBranch(branchName))
                if (!checkForChanges()) alterHEAD(branchName);
                else
                {
                    printf(CHECKOUT_ERROR_MSG_START"There Is Uncommitted Changes"MSG_END);
                    // whatIsTheError();
                    printf(CHECKOUT_REPORT_MSG_START"Use: chz commit"MSG_END);
                }
            else
            {
                printf(CHECKOUT_ERROR_MSG_START"Your Already On %s Branch"MSG_END, branchName);
                // whatIsTheError();
            }
        else
        {
            printf(CHECKOUT_ERROR_MSG_START"Branch %s Does Not Exist"MSG_END, branchName);
            // whatIsTheError();
            printf(CHECKOUT_REPORT_MSG_START"Use: chz checkout -b %s or chz branch %s"MSG_END, branchName);
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
            if(strcmp(argv[ARG_BASE + 1], "-h") == 0)
            {//% chz checkout -h
                checkoutHelp();
            }
            else
            {//% chz checkout <branch-name>
                if (checkChz())
                {
                    preCheckout(argv[ARG_BASE + 2]);
                }
            }
            break;
        //@ chz checkout <arg> <arg>
        case ARG_BASE + 4:
            if(strcmp(argv[ARG_BASE + 1], "-b") == 0)
            {//% chz checkout -b <branch-name>
                if (checkChz())
                {
                    callBranch(argv[ARG_BASE + 3]);
                    preCheckout(argv[ARG_BASE + 3]);
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