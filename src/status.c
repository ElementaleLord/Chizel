//! B: PATRICK WHY THE FUCK DID YOU MAKE A STATUS BRANCH IF YOU DIDNT EVEN FINISH CHECKOUT ?! (idk if status is before checkout)
#include "../include/chizel.h"
#include <dirent.h>

#ifdef _WIN32
#include <direct.h>
#define rmdir(path) _rmdir(path)
#define mkdir(dir) _mkdir(dir)
#endif

char* getCurrentBranchCommit(){
//# searches for and retrieves the current branches head commit path (could just retrieve a file ptr instead)
}

//~ helper that compiles a list (vector) of file paths (strings)
char** getModifiedFileList(char* path_to_commit){
//# compare uses the last modified value of the commit file and all the current files in repo
//# and if it exists the .chzignore file is used to eliminate unneeded cases
}

void sortStaged(char** modList, char** stagedList, char** unstagedList){
//# sorts the modified file list between a staged and unstaged file lists
//# sort is based on the index file (staging area)
}

//~ helper that displays the staged and unstaged files of current branch
void displayStatus(char** stagedList, char** unstagedList){
//# displays based on some format
}

//~ function used as interface to call needed functions
void doStatus(){
    if (checkChz()){
        char* commitPath_ptr= getCurrentBranchCommit();
        char** modFileVect= getModifiedFileList(commitPath_ptr);
        char** stagedFileVect, **unstagedFileVect;
        sortStaged(modFileVect, stagedFileVect, unstagedFileVect);
        displayStatus(stagedFileVect, unstagedFileVect);
    }
}

//~ helper used to display help menu
void statusHelp(){
    printf(STATUS_REPORT_MSG_START"Usage: chz status, chz status -h"MSG_END);
}

void status(int argc, char* argv[])
{
    char path[1024];
    DIR* p_dir;
    
    switch(argc){
        //@ chz status
        case ARG_BASE + 2:
            //% chz status
            doStatus();
            break;
        //@ chz status <arg>
        case ARG_BASE + 3:
            //% chz status -h
            statusHelp();
            break;
        default:
            break;
    }
    close(p_dir);
}

int main(int argc, char* argv[])
{
    status(argc, argv);

    return 0;
}