#include "../include/headers/status.h"
#include "../include/headers/add.h"
#include <dirent.h>

#ifdef _WIN32
#include <direct.h>
#define rmdir(path) _rmdir(path)
#define mkdir(dir) _mkdir(dir)
#define getcwd(dirPath, num) _getcwd(dirPath, num)
#else
#define get_cwd getcwd
#endif

time_t getHeadCommitTime()
{ // # searches for and retrieves the current branches head commit path (could just retrieve a file ptr instead)

    char headPath[1024], branchPath[2048];
    FILE *head_ptr = fopen(HEAD_PATH, "r");
    if (!head_ptr)
    {
        printf(STATUS_ERROR_MSG_START "Failed To Open HEAD File" MSG_END);
        whatIsTheError();
        return -1;
    }
    if (!fgets(headPath, 1024, head_ptr))
    {
        printf(STATUS_ERROR_MSG_START "Failed To Read HEAD File" MSG_END);
        whatIsTheError();
        return -1;
    }
    fclose(head_ptr);

    sprintf(branchPath, CHZ_PATH "/%s", headPath);
    // printf("head= %s\n", headPath);

    FILE *branch_ptr = fopen(branchPath, "r");
    if (!branch_ptr)
    {
        printf(STATUS_ERROR_MSG_START "Failed To Open Branch File" MSG_END);
        whatIsTheError();
        return -1;
    }
    if (!fgets(branchPath, 1024, branch_ptr))
    {
        printf(STATUS_ERROR_MSG_START "Failed To Read Branch File" MSG_END);
        whatIsTheError();
        return -1;
    }
    fclose(branch_ptr);

    char commitPath[1024];

    sprintf(commitPath, OBJECTS_PATH "/%c%c", branchPath[0], branchPath[1]);
    // printf("branch= %s\n", branchPath);
    // printf("commit= %s\n", commitPath);

    DIR *commit_ptr = opendir(commitPath);
    if (!commit_ptr)
    {
        printf(STATUS_ERROR_MSG_START "Failed To Open Commit File" MSG_END);
        whatIsTheError();
        return 0;
    }
    struct dirent *file;
    char fullpath[2048];
    struct stat st;
    while ((file = readdir(commit_ptr)) != NULL)
    {
        if (strcmp(file->d_name, ".") == 0 || strcmp(file->d_name, "..") == 0)
            continue;

        snprintf(fullpath, sizeof(fullpath), "%s/%s", commitPath, file->d_name);
        // printf("full= %s\n", fullpath);

        stat(fullpath, &st);
    }
    closedir(commit_ptr);
    return st.st_mtime;
}

//~ helper that displays the staged and unstaged files of current branch
void displayStatus(Lines list, char *fileType)
{
    printf("-%s Files:\n", fileType);
    for (int i = 0; i < list.size; i++)
    {
        printf("\t%s\n", list.content[i]);
    }
}

Lines getUntrackedFileList(time_t commitTime, Lines fileList)
{ // # sorts the modified file list between a staged and unstaged file lists
    // # sort is based on the index file (staging area)
    Lines stagingList = {0}, untrackedList = {0};
    struct stat st;
    char path[1024], dirPath[512];
    stagingList = readStagingArea();

    if (stagingList.size < 1)
    {
        dynamic_append(&stagingList, strdup(" "));
    }
    getcwd(dirPath, 512);
    for (size_t i = 0; i < fileList.size; i++)
    {
        for (size_t j = 0; j < stagingList.size; j++)
        {
            // printf("%s | %.f\n", fileList.content[i], difftime(st.st_ctime, commitTime));

            sprintf(path, "%s\\%s", dirPath, stagingList.content[j]);
            path[strlen(path) - 1] = '\0';
            // printf("%s\n%s\n\n", path, fileList.content[i]);

            if (strcmp(fileList.content[i], path) != 0)
            {
                stat(fileList.content[i], &st);
                if (difftime(st.st_ctime, commitTime) > 0)
                {
                    dynamic_append(&untrackedList, strdup(fileList.content[i]));
                    break;
                }
            }
        }
    }
    return untrackedList;
}

Lines getModifiedFileList(time_t commitTime, Lines fileList)
{ // # sorts the modified file list between a staged and unstaged file lists
    // # sort is based on the index file (staging area)
    Lines stagingList = {0}, modList = {0};
    struct stat st;
    char path[1024], dirPath[512];
    stagingList = readStagingArea();

    if (stagingList.size < 1)
    {
        dynamic_append(&stagingList, strdup(" "));
    }
    getcwd(dirPath, 512);
    for (size_t i= 0; i < fileList.size; i++){
        for (size_t j= 0; j < stagingList.size; j++){
            // printf("%s | %.f\n", fileList.content[i], difftime(st.st_mtime, commitTime));

            sprintf(path, "%s\\%s", dirPath, stagingList.content[j]);
            path[strlen(path) - 1] = '\0';
            // printf("%s\n%s\n\n", path, fileList.content[i]);

            if (strcmp(fileList.content[i], path) != 0)
            {
                stat(fileList.content[i], &st);
                if (difftime(st.st_mtime, commitTime) < 0) 
                {
                    dynamic_append(&modList, strdup(fileList.content[i]));
                    break;
                }
            }
        }
    }
    return modList;
}

Lines getStagedFileList(time_t commitTime, Lines fileList)
{ // # sorts the modified file list between a staged and unstaged file lists
    // # sort is based on the index file (staging area)
    Lines stagingList = {0}, stagedList = {0};
    struct stat st;
    char path[1024], dirPath[512];
    stagingList = readStagingArea();

    if (stagingList.size < 1)
    {
        dynamic_append(&stagingList, strdup(" "));
    }
    getcwd(dirPath, 512);
    for (size_t i = 0; i < fileList.size; i++)
    {
        for (size_t j = 0; j < stagingList.size; j++)
        {
            // printf("%s | %.f\n", fileList.content[i], difftime(st.st_ctime, commitTime));

            sprintf(path, "%s\\%s", dirPath, stagingList.content[j]);
            path[strlen(path) - 1] = '\0';
            // printf("%s\n%s\n\n", path, fileList.content[i]);

            if (strcmp(fileList.content[i], path) == 0)
            {
                dynamic_append(&stagedList, strdup(fileList.content[i]));
                break;
            }
        }
    }
    return stagedList;
}

//~ gets all modied files and appends to list
void makeModFileList(time_t commitTime, Lines *modFileVect, char *dirPath)
{
    struct dirent *srcIter;
    struct stat st;
    char fullPath[1024];

    DIR *p_srcDir = opendir(dirPath);
    while ((srcIter = readdir(p_srcDir)) != NULL)
    {
        if (strcmp(srcIter->d_name, ".") == 0 ||
            strcmp(srcIter->d_name, "..") == 0 || strcmp(srcIter->d_name, ".chz") == 0)
            continue;

        sprintf(fullPath, "%s\\%s", dirPath, srcIter->d_name);
        stat(fullPath, &st);
        // printf("Recurs= %s | %.f\n", fullPath,  difftime(st.st_mtime, commitTime));

        if (checkIgnore(srcIter->d_name, fullPath))
        { // # checks if fullPath is included in .chzIgnore
            if (S_ISDIR(st.st_mode))
            { // # checks if fullpath is a directory
                makeModFileList(commitTime, modFileVect, fullPath);
            }
            else
            { // # checks if the file has been modified since the commit
                if (difftime(st.st_mtime, commitTime) > 0)
                {
                    dynamic_append(&(*modFileVect), strdup(fullPath));
                }
            }
        }
    }
}

//~ helper that compiles a list (vector) of file paths (strings)
Lines makeModifiedFileList(time_t commitTime)
{ // # compare uses the last modified value of the commit file and all the current files in repo
    // # and if it exists the .chzignore file is used to eliminate unneeded cases
    Lines fileList = {0};
    struct dirent *srcIter;
    struct stat st;
    char fullPath[1024], dirPath[512];

    getcwd(dirPath, 512);
    DIR *p_srcDir = opendir(dirPath);
    if (!p_srcDir)
    {
        printf(MERGE_ERROR_MSG_START "Failed To Open Repository Directory" MSG_END);
        whatIsTheError();
        exit(EXIT_FAILURE);
    }

    while ((srcIter = readdir(p_srcDir)) != NULL)
    {
        if (strcmp(srcIter->d_name, ".") == 0 ||
            strcmp(srcIter->d_name, "..") == 0 || strcmp(srcIter->d_name, ".chz") == 0)
            continue;

        sprintf(fullPath, "%s\\%s", dirPath, srcIter->d_name);
        stat(fullPath, &st);

        // printf("%s |---| %.f\n", fullPath, difftime(st.st_mtime, commitTime));
        if (checkIgnore(srcIter->d_name, fullPath))
        { // # checks if fullPath is included in .chzIgnore
            if (S_ISDIR(st.st_mode))
            { // # checks if fullpath is a directory
                makeModFileList(commitTime, &fileList, fullPath);
            }
            else
            {
                if (difftime(st.st_mtime, commitTime) > 0)
                { // # else checks if the file has been modified since the commit
                    // printf("%s || %.f\n", fullPath, difftime(st.st_mtime, commitTime));
                    dynamic_append(&fileList, strdup(fullPath));
                }
            }
        }
    }
    return fileList;
}

//~ function used as interface to call needed functions
void preAlterStatus()
{
    if (checkChz())
    {
        time_t commitTime = getHeadCommitTime();
        Lines fileList = {0};
        fileList = makeModifiedFileList(commitTime);
        displayStatus(fileList, "Altered");
    }
}

//~ function used as interface to call needed functions
void preUntrackStatus()
{
    if (checkChz())
    {
        time_t commitTime = getHeadCommitTime();
        Lines fileList = {0}, untrackedList = {0};
        fileList = makeModifiedFileList(commitTime);
        untrackedList = getUntrackedFileList(commitTime, fileList);
        displayStatus(untrackedList, "Untracked");
    }
}

//~ function used as interface to call needed functions
void preStagedStatus()
{
    if (checkChz())
    {
        time_t commitTime = getHeadCommitTime();
        Lines fileList = {0}, stagedList = {0};
        fileList = makeModifiedFileList(commitTime);
        stagedList = getStagedFileList(commitTime, fileList);
        displayStatus(stagedList, "Staged");
    }
}

//~ function used as interface to call needed functions
void preModStatus()
{
    if (checkChz())
    {
        time_t commitTime = getHeadCommitTime();
        Lines fileList = {0}, modList = {0};
        fileList = makeModifiedFileList(commitTime);
        modList = getModifiedFileList(commitTime, fileList);
        displayStatus(modList, "Modified");
    }
}

//~ function used as interface to call needed functions
void preStatus()
{
    if (checkChz())
    {
        time_t commitTime = getHeadCommitTime();
        Lines fileList = {0}, stagedList = {0}, modList = {0}, untrackedList = {0};
        fileList = makeModifiedFileList(commitTime);
        stagedList = getStagedFileList(commitTime, fileList);
        displayStatus(stagedList, "Staged");
        modList = getModifiedFileList(commitTime, fileList);
        displayStatus(modList, "Modified");
        untrackedList = getUntrackedFileList(commitTime, fileList);
        displayStatus(untrackedList, "Untracked");
    }
}

//~ helper used to display help menu
void statusHelp()
{
    printf(STATUS_REPORT_MSG_START "Usage: chz status, chz status -h, chz status -a, chz status -m, chz status -s, chz status -u" MSG_END);
}

void status(int argc, char *argv[])
{
    char path[1024];
    DIR *p_dir;

    switch (argc)
    {
    //@ chz status
    case ARG_BASE + 2:
        //% chz status
        preStatus();
        break;
    //@ chz status <arg>
    case ARG_BASE + 3:
        if (strcmp(argv[ARG_BASE + 2], "-h") == 0)
        { //% chz status -h
            statusHelp();
        }
        else if (strcmp(argv[ARG_BASE + 2], "-a") == 0)
        { //% chz status -a
            preAlterStatus();
        }
        else if (strcmp(argv[ARG_BASE + 2], "-m") == 0)
        { //% chz status -m
            preModStatus();
        }
        else if (strcmp(argv[ARG_BASE + 2], "-s") == 0)
        { //% chz status -s
            preStagedStatus();
        }
        else if (strcmp(argv[ARG_BASE + 2], "-u") == 0)
        { //% chz status -u
            preUntrackStatus();
        }
        break;
    default:
        break;
    }
}