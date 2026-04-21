#include "../include/chizel.h"
#include <dirent.h>
#include <sys/stat.h>

#ifdef _WIN32
#include <direct.h>
#define rmdir(path) _rmdir(path)
#define mkdir(dir) _mkdir(dir)
#endif  

//~ used to list all branch names
void listBranches()
{   
    struct dirent *curDir;
    struct stat st;
    DIR* branches = opendir(BRANCHES_PATH);

    printf("Current Branches:\n");
    while((curDir = readdir(branches)) != NULL)
    {
        if(strcmp(curDir->d_name, ".") != 0 && strcmp(curDir->d_name, "..") != 0)
        {
            printf("- %s\n", curDir->d_name);
        }
    }
}

//~ Creates the branch's head reference file
bool createBranch(char* branchName)
{
    if(strcmp(branchName, "main") == 0 || strcmp(branchName, "tag") == 0 || strcmp(branchName, "tags") == 0){
        printf(BRANCH_ERROR_MSG_START"Cannot create a new %s branch"MSG_END, branchName);
        return false;
    }

    struct dirent *curDir;
    struct stat st;
    DIR* branches = opendir(BRANCHES_PATH);

    while((curDir = readdir(branches)) != NULL)
    {
        if(strcmp(curDir->d_name, ".") != 0 && strcmp(curDir->d_name, "..") != 0)
        {
            if(strcmp(curDir->d_name, branchName) == 0){
                printf(BRANCH_ERROR_MSG_START"Branch %s already exists"MSG_END, branchName);
                return false;
            }
        }
    }


    char path[1024];
    snprintf(path, sizeof(path), "%s/%s", REFS_HEADS_PATH, branchName);

    FILE* f = fopen(path, "w");
    if(!f){ return false; }

    char headPath[1024];
    snprintf(headPath, sizeof(headPath), "%s/main", REFS_HEADS_PATH);
    FILE* head = fopen(headPath, "r");
    if(!head){ return false; }

    char buffer[4096];
    while(fgets(buffer, sizeof(buffer), head)){
        fputs(buffer, f);
    }

    char log[1024];
    snprintf(log, sizeof(log), "%s%s.log", LOGS_PATH, branchName);

    FILE* l = fopen(log, "w");
    if(!l){ return false; }

    char data[1024];
    snprintf(data, sizeof(data), "%s/%s", DATA_PATH, branchName);
    #ifdef _WIN32
        mkdir(data);
    #else
        mkdir(data, DEF_PERM);
    #endif

    //% Copying data.pack
    char packPath[1024];
    snprintf(packPath, sizeof(packPath), "%s/%s/data.pack", DATA_PATH, branchName);

    FILE* dataFile = fopen(packPath, "w");
    if(!dataFile){ return false; }

    char headPack[1024];
    snprintf(headPack, sizeof(headPack), "%s/%s/data.pack", DATA_PATH, getHead());
    FILE* headData = fopen(headPack, "r");
    if(!headData){ return false; }

    char bufferData[4096];
    while(fgets(bufferData, sizeof(bufferData), headData)){
        fputs(bufferData, dataFile);
    }

    fclose(f);
    fclose(head);
    fclose(dataFile);
    fclose(headData);
    fclose(l);

    return true;
}

//~ used to soft-delete any empty branch
void deleteBranch(const char* branch)
{
    if(strcmp(branch, "main") == 0 || strcmp(branch, "tag") == 0 || strcmp(branch, "tags") == 0){
        printf(BRANCH_ERROR_MSG_START"Cannot delete %s"MSG_END, branch);
        return;
    }
    struct dirent *curDir;
    int res;
    DIR* branches = opendir(BRANCHES_PATH);

    if(!branch) return;

    char branchPath[1024];
    snprintf(branchPath, sizeof(branchPath), "%s%s", BRANCHES_PATH, branch);
    FILE* br = fopen(branchPath, "r");
    if(!br){
        printf(BRANCH_REPORT_MSG_START"Branch doesnt exist"MSG_END);
        return;
    }
    fclose(br);
    res = remove(branchPath);

    if(res){
        printf(BRANCH_ERROR_MSG_START"Error whilst attempting to delete branch"MSG_END);
    }else{
        printf(BRANCH_REPORT_MSG_START"Successfully deleted branch %s"MSG_END, branch);
    }

    char branchLog[1024];
    snprintf(branchLog, sizeof(branchLog), "%s%s.log", LOGS_PATH, branch);
    remove(branchLog);

    char branchData[1024];
    snprintf(branchData, sizeof(branchData), "%s/%s", DATA_PATH, branch);
    removeDir(branchData);
    remove(branchData);

    //& O: IF the head was the deleted branch (ie: chz branch -D)
    if(strcmp(branch, getHead()) == 0){
        FILE* f = fopen(HEAD_PATH, "w");
        if(!f){ return; }

        fputs("refs/heads/main", f);
        fclose(f);
        printf(CHZ_REPORT_MSG_START"Head reverted back to main"MSG_END);
    }
}

//~ confirmation before deleting head branch
void preDeleteCurrent()
{
    char confirmation;            

    printf(BRANCH_REPORT_MSG_START"You are currently attempting to delete the CURRENT branch %s, ", getHead());
    
    do
    {
        printf("Proceed? [Y/N]: ");
        scanf("%c", &confirmation);
    }while(confirmation != 'y' && confirmation != 'Y' && confirmation != 'n' && confirmation != 'N');

    if(confirmation == 'y' || confirmation == 'Y'){ 
        deleteBranch(getHead());
    }else{ 
        printf(BRANCH_REPORT_MSG_START"Deletion Aborted"MSG_END);
    }
}

//~ Renames a branch
void renameBranch(char* oldName, char* newName)
{
    if(strcmp(oldName, "main") == 0 || strcmp(newName, "main") == 0 || strcmp(oldName, "tag") == 0 || strcmp(newName, "tag") == 0 || strcmp(oldName, "tags") == 0 || strcmp(newName, "tags") == 0){
        printf(BRANCH_ERROR_MSG_START"Cannot manipulate main, tag nor tags"MSG_END);
        return;
    }

    char branchPath[1024];
    snprintf(branchPath, sizeof(branchPath), "%s%s", BRANCHES_PATH, newName);
    FILE* new = fopen(branchPath, "r");
    if(new){
        printf(BRANCH_REPORT_MSG_START"Branch %s already exists"MSG_END, newName);
        return;
    }

    char oldPath[1024];
    snprintf(oldPath, sizeof(oldPath), "%s%s", BRANCHES_PATH, oldName);
    FILE* old = fopen(oldPath, "r");
    if(!old){
        printf(BRANCH_REPORT_MSG_START"Branch %s doesnt exist"MSG_END, oldName);
        return;
    }
    fclose(old);
                
    if(rename(oldPath, branchPath) == 0){ 
        printf(BRANCH_REPORT_MSG_START"Branch Renamed Successfully"MSG_END);
    }
    else{
        printf(BRANCH_ERROR_MSG_START"Failed To Rename Branch %s to %s"MSG_END, oldName, newName);
        return;
    }

    char oldLog[1024], newLog[1024];
    snprintf(oldLog, 1024, "%s%s.log", LOGS_PATH, oldName);
    snprintf(newLog, 1024, "%s%s.log", LOGS_PATH, newName);
    rename(oldLog, newLog);

    char oldData[1024], newData[1024];
    snprintf(oldData, 1024, "%s/%s", DATA_PATH, oldName);
    snprintf(newData, 1024, "%s/%s", DATA_PATH, newName);
    rename(oldData, newData);

    //& O: IF the head was the renamed branch
    if(strcmp(oldName, getHead()) == 0){
        FILE* f = fopen(HEAD_PATH, "w");
        if(!f){ return; }

        char ref[512];
        snprintf(ref, sizeof(ref), "refs/heads/%s", newName);
        fputs(ref, f);
        fclose(f);
        printf(CHZ_REPORT_MSG_START"Head changed to %s"MSG_END, newName);
    }
}

void branchHelp()
{
    printf(BRANCH_REPORT_MSG_START"Usage:\n chz branch | chz branch -a | chz branch -h | ");
    printf("chz branch <branch-name> | chz branch -d <branch-name> | chz branch -D | ");
    printf("chz branch -m <old-branch-name> <new-branch-name>");
}

bool branch(int argc, char* argv[])
{
    char path[1024];
    
    switch(argc)
    {
        //@ chz branch
        case (ARG_BASE + 2):
            //% chz branch
            if(checkChz()){
                listBranches();
            }
            break;

        //@ chz branch <arg>
        case (ARG_BASE + 3):
            if(strcmp(argv[ARG_BASE + 2], "-a") == 0)
            {//% chz branch -a
                if (checkChz())
                {
                    listBranches();
                }
            }
            else if(strcmp(argv[ARG_BASE + 2], "-D") == 0)
            {//% chz branch -D
                preDeleteCurrent();
            }
            else if(strcmp(argv[ARG_BASE + 2], "-h") == 0)
            {//% chz branch -h
                branchHelp();
            }
            else
            {//% chz branch <name>
                if (checkChz())
                {
                    if(createBranch(argv[ARG_BASE + 2]))
                    {
                        printf(BRANCH_REPORT_MSG_START"Successfully Created New Branch %s"MSG_END, argv[ARG_BASE + 2]);
                    }
                    else
                    {
                        printf(BRANCH_ERROR_MSG_START"Failed To Create Branch %s"MSG_END, argv[ARG_BASE + 2]);
                    }
                }
            }
            break;

        //@ chz branch <arg> <arg>
        case (ARG_BASE + 4):
            if(strcmp(argv[ARG_BASE + 2], "-d") == 0)
            {//% chz branch -d <branch>
                if (checkChz())
                {
                    deleteBranch(argv[ARG_BASE + 3]);
                }
            }
            break;

        //@ chz branch <arg> <arg> <arg>
        case (ARG_BASE + 5):
            if(strcmp(argv[ARG_BASE + 2], "-m") == 0)
            {//% chz branch -m <oldName> <newName>
                if (checkChz())
                {
                    renameBranch(argv[ARG_BASE + 3], argv[ARG_BASE + 4]);
                }
            }
            break;

        default:
            printf(CHZ_ERROR_MSG_START"Invalid Command"MSG_END);
            break;
    }
}