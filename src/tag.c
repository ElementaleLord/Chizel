#include "../include/chizel.h"
#include <dirent.h>
#include <fcntl.h>
#include <sys/stat.h>

#ifdef _WIN32
#include <direct.h>
#define rmdir(path) _rmdir(path)
#define mkdir(dir) _mkdir(dir)
#endif

//~ helper used to retrieve the path to the current branch's latest commit
void getCurrentBranchHeadCommitId(char* commitId)
{
    char headPath[1024], branchPath[1024];
    FILE* head_ptr = fopen(HEAD_PATH, "r");
    if (!head_ptr)
    {
        printf(STATUS_ERROR_MSG_START"Failed To Open HEAD File"MSG_END);
        // whatIsTheError();
        //! P: make sure to add to header a prototype for whatIsTheError()
        return;
    }
    if (!fgets(headPath, 1024, head_ptr))
    {
        printf(STATUS_ERROR_MSG_START"Failed To Read HEAD File"MSG_END);
        // whatIsTheError();
        return;
    }
    fclose(head_ptr);

    sprintf(branchPath, CHZ_PATH"/%s", headPath);
    // printf("head= %s\n", headPath);
    
    FILE* branch_ptr = fopen(branchPath, "r");
    if (!branch_ptr)
    {
        printf(STATUS_ERROR_MSG_START"Failed To Open Branch File"MSG_END);
        // whatIsTheError();
        return;
    }
    if (!fgets(commitId, 1024, branch_ptr))
    {
        printf(STATUS_ERROR_MSG_START"Failed To Read Branch File"MSG_END);
        // whatIsTheError();
        return;
    }
    fclose(branch_ptr);
    // printf("branchContent= %s\n", commitId);
}

//~ helper that creates and writes a tag to refs/tag
void lightTag(char* tagName, char* commitId)
{//# tag is a file in ref/tag named tagName and holding the given hash

    char tagPath[1024];

    sprintf(tagPath, REFS_TAGS_PATH"/%s", tagName);
    printf("tagPath= %s\n", tagPath);

    FILE* tag_ptr = fopen(tagPath, "w");
    
    fprintf(tag_ptr, "%s", commitId);

    fclose(tag_ptr);
}

//~ helper that creates and writes an annotated tag to refs/tag
void annotatedTag(char*  tagName, char* commitId, char* tagDescription)
{//# tag is a file in ref/tag named tagName and holding the given hash
//# also holds the tag description, the name of user, email of user, current date

    char tagPath[1024];

    sprintf(tagPath, REFS_TAGS_PATH"/%s", tagName);
    // printf("tagPath= %s\n", tagPath);

    FILE* tag_ptr = fopen(tagPath, "w");
    time_t curTime;
    time(&curTime);

    fprintf(tag_ptr, "%s\nDescription: %s\nDate: %s", commitId, tagDescription, ctime(&curTime));
    
    fclose(tag_ptr);
}

//~ function used to read tag content to terminal
void readTag(char* tagName){
    char tagPath[1024], content[1024];

    sprintf(tagPath, REFS_TAGS_PATH"/%s", tagName);
    // printf("tagRead= %s\n", tagPath);

    FILE* tag_ptr = fopen(tagPath, "r");
    if (!tag_ptr){
        printf(TAG_ERROR_MSG_START"%s Does Not Exist"MSG_END, tagPath);
        // whatIsTheError();
        return;
    }
    printf("Name: %s\n", tagName);
    while (fgets(content, 1024, tag_ptr)){
        printf("%s", content);
    }
}

//~ helper used to check if tag exists
bool checkTag(char* tagName)
{//# checks if a tag named tagName exists if so return true otherwise false

    char tagPath[1024];

    sprintf(tagPath, REFS_TAGS_PATH"/%s", tagName);
    // printf("tagCheck= %s\n", tagPath);

    FILE* tag_ptr = fopen(tagPath, "r");
    if (tag_ptr)
    {
        fclose(tag_ptr);
        return true;
    }
    return false;
}

//~ function used as interface to call needed functions to make a light tag
void preLightTag(char* tagName)
{
    if (checkChz())
        if (!checkTag(tagName))
        {
            char commitId[1024]; 
            getCurrentBranchHeadCommitId(commitId);
            lightTag(tagName, commitId);
        }
        else printf(TAG_ERROR_MSG_START"Tag %s Already Exists, Use Another Name"MSG_END, tagName);
}

//~ function used as interface to call needed functions to make a heavy tag
void preHeavyTag(char* tagName, char* tagDescription)
{
    if (checkChz())
        if (!checkTag(tagName))
        {
            char commitId[1024]; 
            getCurrentBranchHeadCommitId(commitId);
            annotatedTag(tagName, commitId, tagDescription);
        }
        else 
        {
            printf(TAG_ERROR_MSG_START"Tag %s Already Exists, Use Another Name"MSG_END, tagName);
            // whatIsTheError();
        }
}

//~ function used to check and delete tags
void preDeleteTag(char* tagName)
{
    if (checkChz())
        if (checkTag(tagName))
        {   
            char tagPath[1024];
            sprintf(tagPath, REFS_TAGS_PATH"/%s", tagName);
            // printf("tagDel= %s\n", tagPath);
            remove(tagPath);
        }
        else 
        {
            printf(TAG_ERROR_MSG_START"Tag %s Does Not Exist"MSG_END, tagName);
            // whatIsTheError();
        }
}

//~ function used to run checks before reading given tag to terminal
void preReadTag(char* tagName)
{
    if (checkChz())
        if (checkTag(tagName)) readTag(tagName);
        else 
        {
            printf(TAG_ERROR_MSG_START"Tag %s Does Not Exist"MSG_END, tagName);
            // whatIsTheError();
        }
}

//~ helper used to display help menu
void tagHelp()
{
    printf(TAG_REPORT_MSG_START"Usage: chz status, chz status -h."MSG_END);
}

void tag(int argc, char* argv[])
{
    char path[1024];
    DIR* p_dir;
    
    switch(argc){
        //@ chz tag
        case ARG_BASE + 2:
            break;
        //@ chz tag <arg>
        case ARG_BASE + 3:
            if(strcmp(argv[ARG_BASE + 2], "-h") == 0)
            {//% chz tag -h
                tagHelp();
            }
            else
            {//% chz tag <tag-name>
                preLightTag(argv[ARG_BASE + 2]);
            }
            break;
        //@ chz tag <arg> <arg>
        case ARG_BASE + 4:
            if(strcmp(argv[ARG_BASE + 2], "-d") == 0)
            {//% chz tag -d <tag-name>
                preDeleteTag(argv[ARG_BASE + 3]);
            }
            else if(strcmp(argv[ARG_BASE + 2], "-r") == 0)
            {//% chz tag -r <tag-name>
                preReadTag(argv[ARG_BASE + 3]);
            }
            break;
        //@ chz tag <arg> <arg> <arg>
        case ARG_BASE + 5:
            if(strcmp(argv[ARG_BASE + 2], "-a") == 0)
            {//% chz tag -a <tag-name> <description>
                preHeavyTag(argv[ARG_BASE + 3], argv[ARG_BASE + 4]);
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
    tag(argc, argv);
    return 0;
}