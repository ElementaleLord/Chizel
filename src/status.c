#include "../include/chizel.h"
#include <dirent.h>
#include <fcntl.h>
#include <sys/stat.h>

#ifdef _WIN32
#include <direct.h>
#define rmdir(path) _rmdir(path)
#define mkdir(dir) _mkdir(dir)
#endif

time_t getHeadCommitTime(){
//# searches for and retrieves the current branches head commit path (could just retrieve a file ptr instead)

    char path[1024], path1[1024];
    FILE* head_ptr = fopen(HEAD_PATH, "r");
    if (!head_ptr)
    {
        printf(STATUS_ERROR_MSG_START"Failed To Open HEAD File"MSG_END);
        // whatIsTheError();
        //! P: make sure to add to header a prototype for whatIsTheError()
        return -1;
    }
    if (!fgets(path, 1024, head_ptr))
    {
        printf(STATUS_ERROR_MSG_START"Failed To Read HEAD File"MSG_END);
        // whatIsTheError();
        return -1;
    }
    fclose(head_ptr);
    path[strlen(path)-1] = '\0';
    snprintf(path1, sizeof(path1), CHZ_PATH"/%s", path);
    
    FILE* branch_ptr = fopen(path1, "r");
    if (!branch_ptr)
    {
        printf(STATUS_ERROR_MSG_START"Failed To Open Branch File"MSG_END);
        // whatIsTheError();
        return -1;
    }
    if (!fgets(path1, 1024, branch_ptr))
    {
        printf(STATUS_ERROR_MSG_START"Failed To Read Branch File"MSG_END);
        // whatIsTheError();
        return -1;
    }
    fclose(branch_ptr);

    char commitPath[1024];

    sprintf(commitPath, OBJECTS_PATH"/%c%c",path1[0], path1[1]);

    DIR* commit_ptr = opendir(commitPath);
    if (!commit_ptr)
    {
        printf(STATUS_ERROR_MSG_START"Failed To Open Commit File"MSG_END);
        // whatIsTheError();
        return 0;
    }
    struct dirent *file;
    char fullpath[1024];
    struct stat st;
    while((file = readdir(commit_ptr)) != NULL)
    {
        if(strcmp(file->d_name, ".") == 0 || strcmp(file->d_name, "..") == 0) continue;
        
        snprintf(fullpath, sizeof(fullpath), "%s/%s", commitPath, file->d_name);
        
        stat(fullpath, &st);
    }
    closedir(commit_ptr);
    return st.st_mtime;
}

//~ helper that displays the staged and unstaged files of current branch
void displayStatus(char** stagedList, char** unstagedList){
//# displays based on some format
}

void sortStaged(char** modList){
//# sorts the modified file list between a staged and unstaged file lists
//# sort is based on the index file (staging area)

    char** stagedList, ** unstagedList;
    displayStatus(stagedList, unstagedList);
}


//~ helper that compiles a list (vector) of file paths (strings)
void makeModifiedFileList(time_t commitTime){
//# compare uses the last modified value of the commit file and all the current files in repo
//# and if it exists the .chzignore file is used to eliminate unneeded cases

    char** modFileVect;
    sortStaged(modFileVect);
}

//~ function used as interface to call needed functions
void doStatus(){
    if (checkChz()){
        time_t commitTime=  getHeadCommitTime();
        makeModifiedFileList(commitTime);
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
    closedir(p_dir);
}

int main(int argc, char* argv[])
{
    time_t p= getHeadCommitTime();
    printf("\n%d\n",p);
    return 0;
}