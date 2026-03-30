#include "../include/chizel.h"
#include <dirent.h>

#ifdef _WIN32
#include <direct.h>
#define rmdir(path) _rmdir(path)
#define mkdir(dir) _mkdir(dir)
#endif

//~ helper used to retrieve the path to the current branch's latest commit
void getCurrentBranchHeadCommitId(char* commitId)
{
    //#returns path to the current branches head commit
}

//~ helper that creates and writes a tag to refs/tag
void makeTag(char* tagName, char* commitId)
{
    //# tag is a file in ref/tag named tagName and holding the given hash
}

//~ helper that creates and writes an annotated tag to refs/tag
void makeAnnotatedTag(char*  tagName, char* commitId, char* tagDescription)
{
    //# tag is a file in ref/tag named tagName and holding the given hash
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
        if (checkTag(tagName))
        {
            char commitId[1024]; 
            getCurrentBranchHeadCommitId(commitId);
            makeTag(tagName, commitId);
        }
}

//~ function used as interface to call needed functions
void doHeavyTag(char* tagName, char* tagDescription)
{
    if (checkChz())
        if (checkTag(tagName))
        {
            char commitId[1024]; 
            getCurrentBranchHeadCommitId(commitId);
            makeAnnotatedTag(tagName, commitId, tagDescription);
        }
}

//~ helper used to display help menu
void tagHelp()
{
    printf(TAG_REPORT_MSG_START"Usage: chz status, chz status -h."MSG_END);
}

//~ helper used to display an error msg
void annotatedTagError()
{
    printf(TAG_ERROR_MSG_START"Missing Annotated Tag Description"MSG_END);
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
    tag(argc, argv);

    return 0;
}