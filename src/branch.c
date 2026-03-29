#include <dirent.h>
#include <sys/stat.h>
#include <cjson/cJSON.h>
#include "../include/chizel.c"

#ifdef _WIN32
#include <direct.h>
#define rmdir(path) _rmdir(path)
#define mkdir(dir) _mkdir(dir)
#endif  

//~ to add visual distinction between what directories hold what files
void printIndent(int depth)
{
    for(int i = 0; i < depth; i++) printf(" ");
    for(int i = 0; i < depth; i++) printf("-");
}

//$-----------------------------------------------
//~ used to list all branch names
void listBranches()
{   
    struct dirent *curDir;
    struct stat st;
    char path[1024];
    DIR* branchDir= checkBranches(branchDir);

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
        printf(BRANCH_ERROR_MSG_START"Failed To Open Directory %s"MSG_END, path);
        whatIsTheError();
        return;
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
        }
        else
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

    printf(BRANCH_REPORT_MSG_START"Current Files, Branches & Directories:\n");
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
//$-----------------------------------------------

//$-----------------------------------------------
//~ helper function self explanatory
bool createBranch(char* branchName)
{
    //# creates a branch by adding to refs a file named branchName that holds the hash id of the init commit
    //# should first call commit to create and init commit or create one on its own
    //# returns true of succesful flase otherwise
}
//$-----------------------------------------------

//~ function used as interface to call needed functions
void preCreateBranch(char* branchName)
{
    if(createBranch(branchName))
    {
        printf(BRANCH_REPORT_MSG_START"Successfully Created New Branch %s"MSG_END, branchName);
    }
    else
    {
        printf(BRANCH_ERROR_MSG_START"Failed To Create Branch %s"MSG_END, branchName);
        whatIsTheError();
    }
}

//$-----------------------------------------------
//~ used to soft-delete any empty branch
void deleteBranch(const char* path)
{
    struct dirent *curDir;
    struct stat st;
    char confPath[1024];
    bool empty = true;
    DIR* branch = opendir(path);

    if(!branch) return;

    //$ F: rework into function for other places
    //$ F: rework logic due to branch structure
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
        printf(BRANCH_REPORT_MSG_START"Branch non-empty, operation aborted"MSG_END);
        printf(BRANCH_REPORT_MSG_START"Call: chz branch -D to forcefully delete branch"MSG_END);
    }
    else
    {
        snprintf(confPath, sizeof(confPath), "%s/%s", path, "config.json");
        
        if (remove(confPath) != 0)
        {
            printf(BRANCH_ERROR_MSG_START"Failed To Delete Config Of Branch %s"MSG_END, path);
            whatIsTheError();
            return;
        }

        if(rmdir(path) < 0)
        {
            printf(BRANCH_ERROR_MSG_START"Failed To Delete Branch %s"MSG_END, path);
            whatIsTheError();
        }
        else printf(BRANCH_REPORT_MSG_START"Deletion successful"MSG_END);
    }
}
//$-----------------------------------------------

//$-----------------------------------------------
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
        }
        else
        {
            remove(fullpath);
        }
    }

    closedir(branch);
    if(rmdir(path) < 0)
    {
        printf(BRANCH_ERROR_MSG_START"Failed To Delete Branch %s"MSG_END, path);
        whatIsTheError();
    }
    else
    {
        printf(BRANCH_REPORT_MSG_START"Sucessful Force Delete of Branch %s"MSG_END, path);
    }
}
//$-----------------------------------------------

//$-----------------------------------------------
//~ helper used to handle preliminary steps before calling forceDelete()
void preForceDelete(char* path)
{
    char confirmation;            

    printf(BRANCH_REPORT_MSG_START"Force Deleting A Branch Erases All Data Contained Inside, ");
    
    do
    {
        printf("Proceed? [Y/N]: ");
        scanf("%c", &confirmation);
    }while(confirmation != 'y' && confirmation != 'Y' && confirmation != 'n' && confirmation != 'N');

    if(confirmation == 'y' || confirmation == 'Y') forceDelete(path);
    else printf(BRANCH_REPORT_MSG_START"Force Delete Aborted Successfully"MSG_END);
}
//$-----------------------------------------------

//$-----------------------------------------------
//~ helper used to handle preliminary steps before renaming a branch
void preRename(char* path, char* oldName, char* newName)
{
    char newPath[1024];
    DIR *oldDir = opendir(path), *newDir;
                
    if(!oldDir)
    {
        printf(BRANCH_ERROR_MSG_START"Branch %s Not Found"MSG_END, oldName);
        whatIsTheError();
        return;
    }
                  
    snprintf(newPath, sizeof(newPath), "%s/%s", BRANCHES_PATH, newName);
    newDir = opendir(newPath);

    if(newDir)
    {
        printf(BRANCH_REPORT_MSG_START"Branch %s already exists"MSG_END, newName);
        return;
    }
                
    if(rename(path, newPath) == 0) printf(BRANCH_REPORT_MSG_START"Branch Renamed Successfully"MSG_END);
    else
    {
        printf(BRANCH_ERROR_MSG_START"Failed To Rename Branch %s to %s"MSG_END, path, newPath);
        whatIsTheError();
    }
}
//$-----------------------------------------------

void branchHelp()
{
    printf(BRANCH_REPORT_MSG_START"Usage:\n chz branch | chz branch -a | chz branch -h | ");
    printf("chz branch <branch-name> | chz branch -d <branch-name> | chz branch -D <branch-name> | ");
    printf("chz branch -m <old-branch-name> <new-branch-name>");
}

//~ main runner function used to determine case and call appropriate function
bool branch(int argc, char* argv[])
{
    char path[1024];
    DIR* p_dir;
    
    switch(argc)
    {
        //@ chz branch
        case (ARG_BASE + 2):
            //% chz branch
            checkChz(p_dir);
            listBranches();
            break;

        //@ chz branch <arg>
        case (ARG_BASE + 3):
            if(strcmp(argv[ARG_BASE + 2], "-a") == 0)
            {//% chz branch -a
                if (checkChz(p_dir))
                {
                    listEverything(opendir(BRANCHES_PATH));
                }
            }
            else if(strcmp(argv[ARG_BASE + 2], "-h") == 0)
            {//% chz branch -h
                branchHelp();
            }
            else
            {//% chz branch <name>
                if (checkChz(p_dir))
                {
                    preCreateBranch(argv[ARG_BASE + 2]);
                }
            }
            break;

        //@ chz branch <arg> <arg>
        case (ARG_BASE + 4):
            if(strcmp(argv[ARG_BASE + 2], "-d") == 0)
            {//% chz branch -d <branch>
                if (checkChz(p_dir))
                {
                    snprintf(path, sizeof(path), "%s/%s", BRANCHES_PATH, argv[ARG_BASE + 3]);
                    deleteBranch(path);
                }
            }
            else if(strcmp(argv[ARG_BASE + 2], "-D") == 0)
            {//% chz branch -D <branch>
                if (checkChz(p_dir))
                {
                    snprintf(path, sizeof(path), "%s/%s", BRANCHES_PATH, argv[ARG_BASE + 3]);
                    preForceDelete(path);
                }
            }
            break;

        //@ chz branch <arg> <arg> <arg>
        case (ARG_BASE + 5):
            if(strcmp(argv[ARG_BASE + 2], "-m") == 0)
            {//% chz branch -m <oldName> <newName>
                if (checkChz(p_dir))
                {
                    snprintf(path, sizeof(path), "%s/%s", BRANCHES_PATH, argv[ARG_BASE + 3]);
                    preRename(path, argv[ARG_BASE + 3], argv[ARG_BASE + 4]);
                }
            }
            break;
        default:
            printf(CHZ_ERROR_MSG_START"Invalid Command"MSG_END);
            break;
    }
    closedir(p_dir);
}

int main(int argc, char* argv[])
{
    branch(argc, argv);
}