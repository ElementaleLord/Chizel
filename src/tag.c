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

//~ helper used to retrieve the path to the current branch's latest commit
char* getCurrentBranchHeadCommit()
{
    //#returns path to the current branches head commit
}

//~ helper that creates and writes a tag to refs/tag
void makeTag(char* tagName, char* commitPath)
{
    //# tag is a file in ref/tag named tagName and holding the hash pointed to by commitPath
}

//~ helper that creates and writes an annotated tag to refs/tag
void makeAnnotatedTag(char*  tagName, char* commitPath, char* tagDescription)
{
    //# tag is a file in ref/tag named tagName and holding the hash pointed to by commitPath\
    //# also holds the tag description, the name of user, email of user, current date
}

//~ helper used to check if tag exists
bool checkTag(char* tagName){
    //# checks if a tag named tagName exists if so return true otherwise false
}

//~ function used as interface to call needed functions
void doLightTag(char* tagName)
{
    if (checkChz())
    {
        if (checkTag(tagName)){
            char* commitPath= getCurrentBranchHeadCommit();
            makeTag(tagName, commitPath);
        }
    }
}
//~ function used as interface to call needed functions
void doHeavyTag(char* tagName, char* tagDescription)
{
    if (checkChz())
    {
        if (checkTag(tagName)){
            char* commitPath= getCurrentBranchHeadCommit();
            makeAnnotatedTag(tagName, commitPath, tagDescription);
        }
    }
}


//~ helper used to display help menu
void tagHelp(){
    printf("TAG REPORT:\nUsage: chz status, chz status -h.\n");
}

//~ helper used to display an error msg
void annotatedTagError(){
    printf("TAG ERROR: Missing Annotated Tag Description.\n");
}

void checkout(int argc, char* argv[])
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
                doLightTag(argv[ARG_BASE + 3]);
            }
            break;
        //@ chz tag <arg> <arg>
        case ARG_BASE + 4:
            if(strcmp(argv[ARG_BASE + 2], "-a") == 0)
            {//% chz tag -a <tag-name>
                annotatedTagError();
            }
            break;
        //@ chz tag <arg> <arg> <arg>
        case ARG_BASE + 5:
            if(strcmp(argv[ARG_BASE + 2], "-a") == 0)
            {//% chz tag -a <tag-name> <description>
                doHeavyTag(argv[ARG_BASE + 4], argv[ARG_BASE + 5]);
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