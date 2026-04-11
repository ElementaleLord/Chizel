#include "../include/chizel.h"
#include <dirent.h>
#include <fcntl.h>
#include <sys/stat.h>
//! P: getStagingArea() lines_append(res, line) read_file(FILE* f) need to be added to chizel.h first

#ifdef _WIN32
#include <direct.h>
#define rmdir(path) _rmdir(path)
#define mkdir(dir) _mkdir(dir)
#endif


Lines read_file(FILE* f)
{
    Lines result = {0};
    char line[1024];
    while(fgets(line, sizeof(line), f))
    {
        dynamic_append(result, strdup(line));
    }
    
    return result;
}

time_t getHeadCommitTime()
{//# searches for and retrieves the current branches head commit path (could just retrieve a file ptr instead)

    char headPath[1024], branchPath[1024];
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

    sprintf(branchPath, CHZ_PATH"/%s", headPath);
    // printf("head= %s\n", headPath);
    
    FILE* branch_ptr = fopen(branchPath, "r");
    if (!branch_ptr)
    {
        printf(STATUS_ERROR_MSG_START"Failed To Open Branch File"MSG_END);
        // whatIsTheError();
        return -1;
    }
    if (!fgets(branchPath, 1024, branch_ptr))
    {
        printf(STATUS_ERROR_MSG_START"Failed To Read Branch File"MSG_END);
        // whatIsTheError();
        return -1;
    }
    fclose(branch_ptr);

    char commitPath[1024];

    sprintf(commitPath, OBJECTS_PATH"/%c%c", branchPath[0], branchPath[1]);
    // printf("branch= %s\n", branchPath);
    // printf("commit= %s\n", commitPath);

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
        // printf("full= %s\n", fullpath);

        stat(fullpath, &st);
    }
    closedir(commit_ptr);
    return st.st_mtime;
}

//~ helper that displays the staged and unstaged files of current branch
void displayStatus(Lines stagedList, Lines modList, Lines untrackedList)
{
    printf("-Staged Files:\n");
    for (int i= 0; i < stagedList.size; i++)
    {
        printf("\t%s\n", *(stagedList.content + i));
    }
    printf("-Modified Files:\n");
    for (int i= 0; i < modList.size; i++)
    {
        printf("\t%s\n", *(modList.content + i));
    }
    printf("-Untracked Files:\n");
    for (int i= 0; i < untrackedList.size; i++)
    {
        printf("\t%s\n", *(untrackedList.content + i));
    }
}

void sortStaged(time_t commitTime, Lines fileList)
{//# sorts the modified file list between a staged and unstaged file lists
//# sort is based on the index file (staging area)
    Lines stagedList = {0}, modList = {0}, untrackedList = {0}, stagingList = {0};
    struct stat st;
    FILE *stagingFile = getStagingArea();
    stagingList = read_file(stagingFile);

    printf("-Files:\n");
    for (int i= 0; i < fileList.size; i++){
        for (int j= 0; j < stagingList.size; j++){
            printf("%s | %.f\n", *(fileList.content + i), difftime(st.st_ctime, commitTime));

            //# 1 is in index ? if yes put in staged
            if (strcmp(*(fileList.content + i), *(stagingList.content + j)) == 0) 
                //strdup
                dynamic_append(stagedList, *(fileList.content + i));
            else
            {
                stat(*(fileList.content + i), &st);
                //# 2 is created after commit ? if yes put in untracked
                //strdup
                if (difftime(st.st_ctime, commitTime) > 0) dynamic_append(untrackedList, *(fileList.content + i));
                else dynamic_append(modList, *(fileList.content + i)); //strdup
                //# else put in modList
            }
        }
    }
    displayStatus(stagedList, modList, untrackedList);
}

void makeModFileList(time_t commitTime, Lines modFileVect, char* dirPath){
    struct dirent *srcIter;
    struct stat st;
    char fullPath[1024];

    DIR* p_srcDir = opendir(dirPath);
    while((srcIter = readdir(p_srcDir)) != NULL){
        if(strcmp(srcIter->d_name, ".") == 0 || 
        strcmp(srcIter->d_name, "..") == 0 || strcmp(srcIter->d_name, ".chz") == 0) continue;

        sprintf(fullPath, "%s\\%s", dirPath, srcIter->d_name);
        printf("fullModRec= %s\n", fullPath);
        stat(fullPath, &st);

        if (!false) //# checks if fullPath is included in .chzIgnore
        if (S_ISDIR(st.st_mode)) //# checks if fullpath is a directory
        {
            makeModFileList(commitTime, modFileVect, fullPath);
        }
        else
        {
            if (difftime(st.st_ctime, commitTime) > 0){ //# checks if the file has been modified since the commit
                dynamic_append(modFileVect, strdup(fullPath));
            }
        }
    }
}

//~ helper that compiles a list (vector) of file paths (strings)
void makeModifiedFileList(time_t commitTime)
{//# compare uses the last modified value of the commit file and all the current files in repo
//# and if it exists the .chzignore file is used to eliminate unneeded cases

    Lines modFileVect = {0};
    struct dirent *srcIter;
    struct stat st;
    char fullPath[1024], dirPath[512];

    getcwd(dirPath, 512);
    DIR* p_srcDir = opendir(dirPath);
    if(!p_srcDir){
        printf(MERGE_ERROR_MSG_START"Failed To Open Repository Directory"MSG_END);
        // whatIsTheError();
        exit(EXIT_FAILURE);
    }

    while((srcIter = readdir(p_srcDir)) != NULL){
        if(strcmp(srcIter->d_name, ".") == 0 || 
        strcmp(srcIter->d_name, "..") == 0 || strcmp(srcIter->d_name, ".chz") == 0) continue;

        sprintf(fullPath, "%s\\%s", dirPath, srcIter->d_name);
        printf("%s | %.f\n", fullPath, difftime(st.st_ctime, commitTime));

        stat(fullPath, &st);

        if (!false) //# checks if fullPath is included in .chzIgnore
        if (S_ISDIR(st.st_mode)) //# checks if fullpath is a directory
        {
            makeModFileList(commitTime, modFileVect, fullPath);
        }
        else
        {
            if (difftime(st.st_ctime, commitTime) < 0){ //# checks if the file has been modified since the commit
                dynamic_append(modFileVect, strdup(fullPath));
            }
        }
    }
    sortStaged(commitTime, modFileVect);
}

//~ function used as interface to call needed functions
void doStatus()
{
    if (checkChz())
    {
        time_t commitTime=  getHeadCommitTime();
        makeModifiedFileList(commitTime);
    }
}

//~ helper used to display help menu
void statusHelp()
{
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
    status(argc, argv);
    return 0;
}
